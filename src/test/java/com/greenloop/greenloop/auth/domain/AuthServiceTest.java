package com.greenloop.greenloop.auth.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.auth.dto.JwtRes;
import com.greenloop.greenloop.auth.dto.LoginReq;
import com.greenloop.greenloop.auth.dto.RegisterReq;
import com.greenloop.greenloop.auth.exceptions.InvalidCredentialsException;
import com.greenloop.greenloop.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User testUser;
    private RegisterReq registerRequest;
    private LoginReq loginRequest;
    private final String TEST_JWT = "test.jwt.token";

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.USER);
        testUser.setPoints(0);

        // Setup register request
        registerRequest = new RegisterReq(
                "John",
                "Doe",
                "john.doe@example.com",
                "password123"
        );

        // Setup login request
        loginRequest = new LoginReq(
                "john.doe@example.com",
                "password123",
                null
        );

        // Removed the default JWT service behavior from here, will add to individual tests
    }

    @Test
    void register_ShouldCreateNewUserAndReturnJwtResponse() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // The key fix: Make sure the saved user has an ID set properly
        doAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            // Copy testUser properties to the saved user to ensure ID is properly set
            savedUser.setId(1L);
            return savedUser;
        }).when(userRepository).save(any(User.class));

        when(jwtService.generateToken(any(User.class))).thenReturn(TEST_JWT);

        // When
        JwtRes result = authService.register(registerRequest);

        // Then
        verify(userRepository).findByEmail("john.doe@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("John", savedUser.getFirstName());
        assertEquals("Doe", savedUser.getLastName());
        assertEquals("john.doe@example.com", savedUser.getEmail());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals(Role.USER, savedUser.getRole());
        assertEquals(0, savedUser.getPoints());

        assertNotNull(result);
        assertEquals(TEST_JWT, result.getToken());
        assertNotNull(result.getUser());
        assertEquals(1L, result.getUser().getId());
        assertEquals("John", result.getUser().getFirstName());
        assertEquals("Doe", result.getUser().getLastName());
    }

    @Test
    void register_WithExistingEmail_ShouldThrowException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(testUser);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email is already in use", exception.getMessage());
        verify(userRepository).findByEmail("john.doe@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ShouldAuthenticateAndReturnJwtResponse() {
        // Given
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("john.doe@example.com");
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn(TEST_JWT); // Added here

        // When
        JwtRes result = authService.login(loginRequest);

        // Then
        verify(authenticationManager).authenticate(
                argThat(auth ->
                    auth instanceof UsernamePasswordAuthenticationToken &&
                    "john.doe@example.com".equals(((UsernamePasswordAuthenticationToken) auth).getPrincipal()) &&
                    "password123".equals(((UsernamePasswordAuthenticationToken) auth).getCredentials())
                )
        );

        assertNotNull(result);
        assertEquals(TEST_JWT, result.getToken());
        assertNotNull(result.getUser());
        assertEquals(1L, result.getUser().getId());
        assertEquals("John", result.getUser().getFirstName());
        assertEquals("USER", result.getUser().getRole());
    }

    @Test
    void login_WithInvalidCredentials_ShouldThrowException() {
        // Given
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        // When & Then
        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void login_WithInvalidRole_ShouldThrowException() {
        // Given
        LoginReq requestWithRole = new LoginReq("john.doe@example.com", "password123", "ADMIN");

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("john.doe@example.com");
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(testUser);

        // When & Then
        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(requestWithRole);
        });

        assertEquals("User does not have the required role", exception.getMessage());
    }
}
