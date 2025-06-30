package com.greenloop.greenloop.auth.application;

import com.greenloop.greenloop.auth.domain.AuthService;
import com.greenloop.greenloop.auth.dto.JwtRes;
import com.greenloop.greenloop.auth.dto.LoginReq;
import com.greenloop.greenloop.auth.dto.RegisterReq;
import com.greenloop.greenloop.email.WelcomeEmailEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import java.util.stream.Collectors;
import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @PostMapping("/signup")
    public ResponseEntity<JwtRes> register(@RequestBody RegisterReq request) {
        applicationEventPublisher.publishEvent(new WelcomeEmailEvent(this, request.getEmail(), request.getFirstName()));
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtRes> signin(@RequestBody LoginReq request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String)) {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            return ResponseEntity.ok(Map.of(
                "username", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList())
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
    }
}