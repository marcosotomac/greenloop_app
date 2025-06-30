package com.greenloop.greenloop.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.greenloop.greenloop.jwt.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Lista de rutas que no requieren autenticación
    private final List<String> excludedPaths = Arrays.asList(
            "/auth/signup",
            "/auth/signin",
            "/api/ai/",
            "/api/chats/debug",
            "/ws/");

    public JwtRequestFilter(JwtService jwtService, @Lazy UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain chain)
            throws ServletException, IOException {
        final String requestPath = request.getRequestURI();

        // Verificar si la ruta debe ser excluida del filtro JWT
        if (isExcludedPath(requestPath)) {
            logger.info("Ruta excluida del filtro JWT: " + requestPath);
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        // Log para depuración
        logger.info("Procesando solicitud: " + requestPath);
        logger.info("Authorization header presente: " + (authorizationHeader != null));

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtService.extractUserName(jwt);
                logger.info("Username extraído del token: " + username);
            } catch (Exception e) {
                logger.error("Token JWT inválido o expirado: " + e.getMessage());
            }
        } else {
            logger.info("No se encontró un token Bearer válido en la solicitud");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.info("Usuario cargado correctamente: " + username);

                if (jwtService.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Autenticación establecida para usuario: " + username +
                            " con roles: " + userDetails.getAuthorities());
                } else {
                    logger.warn("Token no válido para el usuario: " + username);
                }
            } catch (Exception e) {
                logger.error("Error al cargar usuario para autenticación: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Verifica si la ruta debe ser excluida del filtro JWT
     */
    private boolean isExcludedPath(String requestPath) {
        return excludedPaths.stream().anyMatch(requestPath::startsWith);
    }
}