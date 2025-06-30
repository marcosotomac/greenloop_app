package com.greenloop.greenloop.auth.domain;

import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.auth.application.IAuthUseCase;
import com.greenloop.greenloop.auth.dto.JwtRes;
import com.greenloop.greenloop.auth.dto.LoginReq;
import com.greenloop.greenloop.auth.dto.RegisterReq;
import com.greenloop.greenloop.auth.exceptions.InvalidCredentialsException;
import com.greenloop.greenloop.auth.exceptions.UserNotFoundException;
import com.greenloop.greenloop.jwt.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Date;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Validated
public class AuthService implements IAuthUseCase {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public JwtRes register(@Valid RegisterReq request) {
        // Validar email único
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Crear y configurar nuevo usuario
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        //user.setJoinedAt(new Date());
        user.setPoints(0);
        user.setItemsDonated(0);
        user.setItemsExchanged(0);
        user.setLevel("Beginner");

        // Guardar usuario
        userRepository.save(user);

        // Generar token JWT
        String token = jwtService.generateToken(user);
        
        // Crear respuesta con token e información básica del usuario
        JwtRes response = new JwtRes(token);
        response.setUser(createBasicUserInfo(user));
        
        return response;
    }

    @Override
    public JwtRes login(@Valid LoginReq request) {
        try {
            // Autenticar usando AuthenticationManager (usa CustomUserDetailsService internamente)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            
            // Obtener el UserDetails del usuario autenticado
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Obtener el usuario completo de la base de datos
            User user = userRepository.findByEmail(userDetails.getUsername());
            
            // Verificar si el rol solicitado coincide (si se proporcionó)
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                boolean hasRole = user.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals(request.getRole()));
                if (!hasRole) {
                    throw new InvalidCredentialsException("User does not have the required role");
                }
            }
            
            // Generar token JWT
            String token = jwtService.generateToken(user);
            
            // Crear respuesta con token e información básica del usuario
            JwtRes response = new JwtRes(token);
            response.setUser(createBasicUserInfo(user));
            
            return response;
            
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    private BasicUserInfo createBasicUserInfo(User user) {
        return new BasicUserInfo(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPoints()
        );
    }
}