package com.greenloop.greenloop.exchange.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.exchange.domain.ExchangeService;
import com.greenloop.greenloop.exchange.domain.ExchangeStatus;
import com.greenloop.greenloop.exchange.dto.ExchangeRequest;
import com.greenloop.greenloop.exchange.dto.ExchangeResponse;
import com.greenloop.greenloop.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithSecurityContext;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.lang.annotation.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExchangeController.class)
class ExchangeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ExchangeService exchangeService;

    @MockitoBean
    private JwtService jwtService;

    private User testUser;
    private User providerUser;
    private ExchangeRequest exchangeRequest;
    private ExchangeResponse exchangeResponse;
    private List<ExchangeResponse> exchangeResponses;
    private LocalDateTime now;

    // Custom annotation to create a User as the authentication principal
    @Retention(RetentionPolicy.RUNTIME)
    @WithSecurityContext(factory = WithMockCustomUserSecurityContextFactory.class)
    @interface WithMockCustomUser {
        long id() default 1L;
        String firstName() default "John";
        String lastName() default "Doe";
        String email() default "john.doe@example.com";
        String role() default "USER";
    }

    // Security context factory to create a User object as the principal
    static class WithMockCustomUserSecurityContextFactory implements WithSecurityContextFactory<WithMockCustomUser> {
        @Override
        public SecurityContext createSecurityContext(WithMockCustomUser customUser) {
            SecurityContext context = SecurityContextHolder.createEmptyContext();

            User principal = new User();
            principal.setId(customUser.id());
            principal.setFirstName(customUser.firstName());
            principal.setLastName(customUser.lastName());
            principal.setEmail(customUser.email());
            principal.setRole(Role.valueOf(customUser.role()));

            Authentication auth = new UsernamePasswordAuthenticationToken(principal, "password", principal.getAuthorities());
            context.setAuthentication(auth);
            return context;
        }
    }

    // A request post processor to set the principal directly in tests if needed
    private static RequestPostProcessor userPrincipal(User user) {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(user, "password", user.getAuthorities()));
            return request;
        };
    }

    @BeforeEach
    void setUp() {
        // Set up current time
        now = LocalDateTime.now();

        // Set up test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.USER);

        // Set up provider user
        providerUser = new User();
        providerUser.setId(2L);
        providerUser.setFirstName("Jane");
        providerUser.setLastName("Smith");
        providerUser.setEmail("jane.smith@example.com");
        providerUser.setRole(Role.USER);

        // Set up exchange request
        exchangeRequest = new ExchangeRequest();
        exchangeRequest.setRequestedProductId(1L);
        exchangeRequest.setOfferedProductId(2L);

        // Set up exchange response
        exchangeResponse = ExchangeResponse.builder()
                .exchangeId(1L)
                .requesterId(1L)
                .requesterName("John Doe")
                .providerId(2L)
                .providerName("Jane Smith")
                .requestedProductId(1L)
                .requestedProductName("Requested Product")
                .requestedProductImage("http://example.com/requested.jpg")
                .offeredProductId(2L)
                .offeredProductName("Offered Product")
                .offeredProductImage("http://example.com/offered.jpg")
                .requestedAt(now)
                .status(ExchangeStatus.PENDING.name())
                .build();

        // Set up list of exchange responses
        exchangeResponses = Arrays.asList(exchangeResponse);
    }

    @Test
    @WithMockCustomUser
    void requestExchange_Success() throws Exception {
        // Configure mock service methods
        when(exchangeService.requestExchange(any(ExchangeRequest.class), eq(1L))).thenReturn(exchangeResponse);

        mockMvc.perform(post("/api/exchanges")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exchangeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeId", is(1)))
                .andExpect(jsonPath("$.requesterId", is(1)))
                .andExpect(jsonPath("$.requesterName", is("John Doe")))
                .andExpect(jsonPath("$.providerId", is(2)))
                .andExpect(jsonPath("$.requestedProductName", is("Requested Product")))
                .andExpect(jsonPath("$.offeredProductName", is("Offered Product")))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    @WithMockCustomUser(id = 2L, firstName = "Jane", lastName = "Smith", email = "jane.smith@example.com")
    void acceptExchange_Success() throws Exception {
        // Configure mock service methods
        ExchangeResponse acceptedResponse = ExchangeResponse.builder()
                .exchangeId(1L)
                .requesterId(1L)
                .requesterName("John Doe")
                .providerId(2L)
                .providerName("Jane Smith")
                .requestedProductId(1L)
                .requestedProductName("Requested Product")
                .offeredProductId(2L)
                .offeredProductName("Offered Product")
                .requestedAt(now)
                .status(ExchangeStatus.ACCEPTED.name())
                .build();

        when(exchangeService.acceptExchange(eq(1L), eq(2L))).thenReturn(acceptedResponse);

        mockMvc.perform(put("/api/exchanges/1/accept")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeId", is(1)))
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
    }

    @Test
    @WithMockCustomUser
    void completeExchange_Success() throws Exception {
        // Configure mock service methods
        ExchangeResponse completedResponse = ExchangeResponse.builder()
                .exchangeId(1L)
                .requesterId(1L)
                .requesterName("John Doe")
                .providerId(2L)
                .providerName("Jane Smith")
                .requestedProductId(1L)
                .requestedProductName("Requested Product")
                .offeredProductId(2L)
                .offeredProductName("Offered Product")
                .requestedAt(now)
                .completedAt(now)
                .status(ExchangeStatus.COMPLETED.name())
                .build();

        when(exchangeService.completeExchange(eq(1L), eq(1L))).thenReturn(completedResponse);

        mockMvc.perform(put("/api/exchanges/1/complete")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeId", is(1)))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    @WithMockCustomUser(id = 2L, firstName = "Jane", lastName = "Smith", email = "jane.smith@example.com")
    void rejectExchange_Success() throws Exception {
        // Configure mock service methods
        ExchangeResponse rejectedResponse = ExchangeResponse.builder()
                .exchangeId(1L)
                .requesterId(1L)
                .requesterName("John Doe")
                .providerId(2L)
                .providerName("Jane Smith")
                .requestedProductId(1L)
                .requestedProductName("Requested Product")
                .offeredProductId(2L)
                .offeredProductName("Offered Product")
                .requestedAt(now)
                .status(ExchangeStatus.REJECTED.name())
                .build();

        when(exchangeService.rejectExchange(eq(1L), eq(2L))).thenReturn(rejectedResponse);

        mockMvc.perform(put("/api/exchanges/1/reject")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeId", is(1)))
                .andExpect(jsonPath("$.status", is("REJECTED")));
    }

    @Test
    @WithMockCustomUser
    void cancelExchange_Success() throws Exception {
        // Configure mock service methods
        ExchangeResponse cancelledResponse = ExchangeResponse.builder()
                .exchangeId(1L)
                .requesterId(1L)
                .requesterName("John Doe")
                .providerId(2L)
                .providerName("Jane Smith")
                .requestedProductId(1L)
                .requestedProductName("Requested Product")
                .offeredProductId(2L)
                .offeredProductName("Offered Product")
                .requestedAt(now)
                .status(ExchangeStatus.CANCELLED.name())
                .build();

        when(exchangeService.cancelExchange(eq(1L), eq(1L))).thenReturn(cancelledResponse);

        mockMvc.perform(put("/api/exchanges/1/cancel")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeId", is(1)))
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @WithMockCustomUser
    void getRequestedExchanges_Success() throws Exception {
        // Configure mock service methods
        when(exchangeService.getRequestedExchanges(eq(1L))).thenReturn(exchangeResponses);

        mockMvc.perform(get("/api/exchanges/requested"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].exchangeId", is(1)))
                .andExpect(jsonPath("$[0].requesterName", is("John Doe")))
                .andExpect(jsonPath("$[0].status", is("PENDING")));
    }

    @Test
    @WithMockCustomUser(id = 2L, firstName = "Jane", lastName = "Smith", email = "jane.smith@example.com")
    void getProvidedExchanges_Success() throws Exception {
        // Configure mock service methods
        when(exchangeService.getProvidedExchanges(eq(2L))).thenReturn(exchangeResponses);

        mockMvc.perform(get("/api/exchanges/provided"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].exchangeId", is(1)))
                .andExpect(jsonPath("$[0].providerName", is("Jane Smith")))
                .andExpect(jsonPath("$[0].status", is("PENDING")));
    }
}
