package com.greenloop.greenloop.auth.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.auth.domain.AuthService;
import com.greenloop.greenloop.auth.dto.JwtRes;
import com.greenloop.greenloop.auth.dto.LoginReq;
import com.greenloop.greenloop.auth.dto.RegisterReq;
import com.greenloop.greenloop.auth.exceptions.InvalidCredentialsException;
import com.greenloop.greenloop.email.WelcomeEmailEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper = new ObjectMapper();
    private RegisterReq registerRequest;
    private LoginReq loginRequest;
    private JwtRes jwtResponse;
    private BasicUserInfo userInfo;

    @BeforeEach
    void setUp() {
        // Setup test data
        registerRequest = new RegisterReq(
                "John",
                "Doe",
                "john.doe@example.com",
                "password123"
        );

        loginRequest = new LoginReq(
                "john.doe@example.com",
                "password123",
                null
        );

        userInfo = new BasicUserInfo(
                1L,
                "John",
                "Doe",
                "john.doe@example.com",
                "USER",
                0
        );

        jwtResponse = new JwtRes("test.jwt.token");
        jwtResponse.setUser(userInfo);
    }

    @Test
    void register_ShouldReturnJwtResponse() {
        // Given
        when(authService.register(any(RegisterReq.class))).thenReturn(jwtResponse);

        // When
        ResponseEntity<JwtRes> responseEntity = authController.register(registerRequest);

        // Then
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(jwtResponse, responseEntity.getBody());

        // Verify welcome email event was published
        ArgumentCaptor<WelcomeEmailEvent> eventCaptor = ArgumentCaptor.forClass(WelcomeEmailEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        WelcomeEmailEvent capturedEvent = eventCaptor.getValue();
        assertEquals("john.doe@example.com", capturedEvent.getEmail());
        assertEquals("John", capturedEvent.getName());

        verify(authService).register(any(RegisterReq.class));
    }

    @Test
    void signin_ShouldReturnJwtResponse() {
        // Given
        when(authService.login(any(LoginReq.class))).thenReturn(jwtResponse);

        // When
        ResponseEntity<JwtRes> responseEntity = authController.signin(loginRequest);

        // Then
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(jwtResponse, responseEntity.getBody());

        verify(authService).login(any(LoginReq.class));
    }

    @Test
    void signin_WithInvalidCredentials_ShouldThrowException() {
        // Given
        when(authService.login(any(LoginReq.class)))
            .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        // When & Then
        assertThrows(InvalidCredentialsException.class, () -> {
            authController.signin(loginRequest);
        });

        // Verify the mock was called
        verify(authService).login(any(LoginReq.class));
    }

    @Test
    void getCurrentUser_WhenAuthenticated_ShouldReturnUserDetails() {
        // Given
        UserDetails userDetails = new User(
                "john.doe@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);

        try {
            // When
            ResponseEntity<?> responseEntity = authController.getCurrentUser();

            // Then
            assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
            assertInstanceOf(Map.class, responseEntity.getBody());

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) responseEntity.getBody();

            assertEquals("john.doe@example.com", body.get("username"));
        } finally {
            // Clean up the SecurityContext
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void getCurrentUser_WhenNotAuthenticated_ShouldReturnUnauthorized() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(false);
        SecurityContextHolder.setContext(securityContext);

        try {
            // When
            ResponseEntity<?> responseEntity = authController.getCurrentUser();

            // Then
            assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
            assertEquals("No autenticado", responseEntity.getBody());
        } finally {
            // Clean up the SecurityContext
            SecurityContextHolder.clearContext();
        }
    }
}
