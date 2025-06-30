package com.greenloop.greenloop.exchange.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.exchange.dto.ExchangeRequest;
import com.greenloop.greenloop.exchange.dto.ExchangeResponse;
import com.greenloop.greenloop.exchange.infraestructure.ExchangeRepository;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductService;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExchangeServiceTest {

    @Mock
    private ExchangeRepository exchangeRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private ExchangeService exchangeService;

    @Captor
    private ArgumentCaptor<Exchange> exchangeCaptor;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User requester;
    private User provider;
    private Product requestedProduct;
    private Product offeredProduct;
    private Exchange exchange;
    private ExchangeRequest exchangeRequest;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        // Setup requester user
        requester = new User();
        requester.setId(1L);
        requester.setFirstName("John");
        requester.setLastName("Doe");
        requester.setEmail("john.doe@example.com");
        requester.setRole(Role.USER);
        requester.setPoints(0);
        requester.setItemsExchanged(0);

        // Setup provider user
        provider = new User();
        provider.setId(2L);
        provider.setFirstName("Jane");
        provider.setLastName("Smith");
        provider.setEmail("jane.smith@example.com");
        provider.setRole(Role.USER);
        provider.setPoints(0);
        provider.setItemsExchanged(0);

        // Setup requested product
        requestedProduct = new Product();
        requestedProduct.setProductId(1L);
        requestedProduct.setProductName("Requested Product");
        requestedProduct.setDescription("A product to request");
        requestedProduct.setImageUrl("http://example.com/requested.jpg");
        requestedProduct.setUser(provider);
        requestedProduct.setStatus(ProductStatus.ACTIVE);

        // Setup offered product
        offeredProduct = new Product();
        offeredProduct.setProductId(2L);
        offeredProduct.setProductName("Offered Product");
        offeredProduct.setDescription("A product to offer");
        offeredProduct.setImageUrl("http://example.com/offered.jpg");
        offeredProduct.setUser(requester);
        offeredProduct.setStatus(ProductStatus.ACTIVE);

        // Setup exchange request DTO
        exchangeRequest = new ExchangeRequest();
        exchangeRequest.setRequestedProductId(1L);
        exchangeRequest.setOfferedProductId(2L);

        // Setup exchange object
        exchange = new Exchange();
        exchange.setExchangeId(1L);
        exchange.setRequester(requester);
        exchange.setProvider(provider);
        exchange.setRequestedProduct(requestedProduct);
        exchange.setOfferedProduct(offeredProduct);
        exchange.setRequestedAt(now);
        exchange.setStatus(ExchangeStatus.PENDING);
    }

    @Test
    void requestExchange_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(productRepository.findById(1L)).thenReturn(Optional.of(requestedProduct));
        when(productRepository.findById(2L)).thenReturn(Optional.of(offeredProduct));
        when(exchangeRepository.save(any(Exchange.class))).thenReturn(exchange);

        // When
        ExchangeResponse response = exchangeService.requestExchange(exchangeRequest, 1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getExchangeId());
        assertEquals(1L, response.getRequesterId());
        assertEquals("John Doe", response.getRequesterName());
        assertEquals(2L, response.getProviderId());
        assertEquals("Jane Smith", response.getProviderName());
        assertEquals(1L, response.getRequestedProductId());
        assertEquals("Requested Product", response.getRequestedProductName());
        assertEquals(2L, response.getOfferedProductId());
        assertEquals("Offered Product", response.getOfferedProductName());
        assertEquals(ExchangeStatus.PENDING.name(), response.getStatus());

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(productRepository).findById(1L);
        verify(productRepository).findById(2L);
        verify(exchangeRepository).save(exchangeCaptor.capture());

        Exchange savedExchange = exchangeCaptor.getValue();
        assertEquals(requester, savedExchange.getRequester());
        assertEquals(provider, savedExchange.getProvider());
        assertEquals(requestedProduct, savedExchange.getRequestedProduct());
        assertEquals(offeredProduct, savedExchange.getOfferedProduct());
    }

    @Test
    void requestExchange_OfferingOthersProduct_ThrowsException() {
        // Given
        offeredProduct.setUser(provider); // Product owned by another user

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(productRepository.findById(1L)).thenReturn(Optional.of(requestedProduct));
        when(productRepository.findById(2L)).thenReturn(Optional.of(offeredProduct));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.requestExchange(exchangeRequest, 1L);
        });

        assertEquals("You can only offer your own products for exchange", exception.getMessage());
        verify(exchangeRepository, never()).save(any(Exchange.class));
    }

    @Test
    void requestExchange_ExchangingWithSelf_ThrowsException() {
        // Given
        requestedProduct.setUser(requester); // Both products owned by same user

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(productRepository.findById(1L)).thenReturn(Optional.of(requestedProduct));
        when(productRepository.findById(2L)).thenReturn(Optional.of(offeredProduct));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.requestExchange(exchangeRequest, 1L);
        });

        assertEquals("You cannot exchange products with yourself", exception.getMessage());
        verify(exchangeRepository, never()).save(any(Exchange.class));
    }

    @Test
    void acceptExchange_Success() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));
        when(exchangeRepository.save(any(Exchange.class))).thenReturn(exchange);

        // When
        ExchangeResponse response = exchangeService.acceptExchange(1L, 2L);

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(exchangeRepository).findById(1L);
        verify(exchangeRepository).save(exchangeCaptor.capture());

        Exchange savedExchange = exchangeCaptor.getValue();
        assertEquals(ExchangeStatus.ACCEPTED, savedExchange.getStatus());
    }

    @Test
    void acceptExchange_WrongProvider_ThrowsException() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.acceptExchange(1L, 3L); // Wrong provider ID
        });

        assertEquals("Only the provider can accept this exchange", exception.getMessage());
        verify(exchangeRepository, never()).save(any(Exchange.class));
    }

    @Test
    void acceptExchange_NotPending_ThrowsException() {
        // Given
        exchange.setStatus(ExchangeStatus.COMPLETED);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.acceptExchange(1L, 2L);
        });

        assertEquals("This exchange is not in a pending state", exception.getMessage());
        verify(exchangeRepository, never()).save(any(Exchange.class));
    }

    @Test
    void completeExchange_Success() {
        // Given
        exchange.setStatus(ExchangeStatus.ACCEPTED);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));
        when(exchangeRepository.save(any(Exchange.class))).thenReturn(exchange);
        doNothing().when(productService).markProductAsExchanged(any(Product.class));

        // When
        ExchangeResponse response = exchangeService.completeExchange(1L, 1L); // Requester completes

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(exchangeRepository).findById(1L);
        verify(exchangeRepository).save(exchangeCaptor.capture());
        verify(userRepository).save(requester);
        verify(userRepository).save(provider);
        verify(productService).markProductAsExchanged(requestedProduct);
        verify(productService).markProductAsExchanged(offeredProduct);

        Exchange savedExchange = exchangeCaptor.getValue();
        assertEquals(ExchangeStatus.COMPLETED, savedExchange.getStatus());
        assertNotNull(savedExchange.getCompletedAt());

        // Verify product ownership changes
        assertEquals(requester, requestedProduct.getUser());
        assertEquals(provider, offeredProduct.getUser());

        // Verify points and counters updated
        assertEquals(10, requester.getPoints());
        assertEquals(10, provider.getPoints());
        assertEquals(1, requester.getItemsExchanged());
        assertEquals(1, provider.getItemsExchanged());
    }

    @Test
    void completeExchange_NotParticipant_ThrowsException() {
        // Given
        exchange.setStatus(ExchangeStatus.ACCEPTED);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.completeExchange(1L, 3L); // Not a participant
        });

        assertEquals("Only participants can complete this exchange", exception.getMessage());
    }

    @Test
    void completeExchange_NotAccepted_ThrowsException() {
        // Given
        exchange.setStatus(ExchangeStatus.PENDING);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.completeExchange(1L, 1L);
        });

        assertEquals("This exchange is not in an accepted state", exception.getMessage());
    }

    @Test
    void rejectExchange_Success() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));
        when(exchangeRepository.save(any(Exchange.class))).thenReturn(exchange);

        // When
        ExchangeResponse response = exchangeService.rejectExchange(1L, 2L); // Provider rejects

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(exchangeRepository).findById(1L);
        verify(exchangeRepository).save(exchangeCaptor.capture());

        Exchange savedExchange = exchangeCaptor.getValue();
        assertEquals(ExchangeStatus.REJECTED, savedExchange.getStatus());
    }

    @Test
    void rejectExchange_NotProvider_ThrowsException() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.rejectExchange(1L, 1L); // Requester tries to reject
        });

        assertEquals("Only the provider can reject this exchange", exception.getMessage());
    }

    @Test
    void rejectExchange_NotPending_ThrowsException() {
        // Given
        exchange.setStatus(ExchangeStatus.ACCEPTED);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.rejectExchange(1L, 2L);
        });

        assertEquals("This exchange is not in a pending state", exception.getMessage());
    }

    @Test
    void cancelExchange_Success() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));
        when(exchangeRepository.save(any(Exchange.class))).thenReturn(exchange);

        // When
        ExchangeResponse response = exchangeService.cancelExchange(1L, 1L); // Requester cancels

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(exchangeRepository).findById(1L);
        verify(exchangeRepository).save(exchangeCaptor.capture());

        Exchange savedExchange = exchangeCaptor.getValue();
        assertEquals(ExchangeStatus.CANCELLED, savedExchange.getStatus());
    }

    @Test
    void cancelExchange_NotRequester_ThrowsException() {
        // Given
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.cancelExchange(1L, 2L); // Provider tries to cancel
        });

        assertEquals("Only the requester can cancel this exchange", exception.getMessage());
    }

    @Test
    void cancelExchange_InvalidState_ThrowsException() {
        // Given
        exchange.setStatus(ExchangeStatus.COMPLETED);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(exchange));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            exchangeService.cancelExchange(1L, 1L);
        });

        assertEquals("This exchange cannot be cancelled in its current state", exception.getMessage());
    }

    @Test
    void getRequestedExchanges_Success() {
        // Given
        List<Exchange> exchanges = Arrays.asList(exchange);
        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(exchangeRepository.findByRequester(requester)).thenReturn(exchanges);

        // When
        List<ExchangeResponse> responses = exchangeService.getRequestedExchanges(1L);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getExchangeId());

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(exchangeRepository).findByRequester(requester);
    }

    @Test
    void getProvidedExchanges_Success() {
        // Given
        List<Exchange> exchanges = Arrays.asList(exchange);
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(exchangeRepository.findByProvider(provider)).thenReturn(exchanges);

        // When
        List<ExchangeResponse> responses = exchangeService.getProvidedExchanges(2L);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getExchangeId());

        // Verify repository calls
        verify(userRepository).findById(2L);
        verify(exchangeRepository).findByProvider(provider);
    }
}
