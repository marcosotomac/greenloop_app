package com.greenloop.greenloop.exchange.domain;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.exchange.dto.ExchangeRequest;
import com.greenloop.greenloop.exchange.dto.ExchangeResponse;
import com.greenloop.greenloop.exchange.dto.ExchangeStatistics;
import com.greenloop.greenloop.exchange.infraestructure.ExchangeRepository;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductService;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.dto.ProductResponseDto;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExchangeService {

        private final ExchangeRepository exchangeRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ProductService productService;

        @Transactional
        public ExchangeResponse requestExchange(ExchangeRequest exchangeRequest, Long requesterId) {
                User requester = userRepository.findById(requesterId)
                                .orElseThrow(() -> new EntityNotFoundException("Requester not found"));

                Product requestedProduct = productRepository.findById(exchangeRequest.getRequestedProductId())
                                .orElseThrow(() -> new EntityNotFoundException("Requested product not found"));

                Product offeredProduct = productRepository.findById(exchangeRequest.getOfferedProductId())
                                .orElseThrow(() -> new EntityNotFoundException("Offered product not found"));

                // Validar que ambos productos estén disponibles para intercambio y en estado
                // activo
                if (!requestedProduct.canBeExchanged()) {
                        throw new IllegalStateException("The requested product is not available for exchange");
                }

                if (!offeredProduct.canBeExchanged()) {
                        throw new IllegalStateException("The offered product is not available for exchange");
                }

                // Validar que el usuario solicitante sea el dueño del producto ofrecido
                if (!offeredProduct.getUser().getId().equals(requesterId)) {
                        throw new IllegalStateException("You can only offer your own products for exchange");
                }

                User provider = requestedProduct.getUser();

                // Validar que el proveedor no sea el mismo que el solicitante
                if (provider.getId().equals(requesterId)) {
                        throw new IllegalStateException("You cannot exchange products with yourself");
                }

                Exchange exchange = new Exchange();
                exchange.setRequester(requester);
                exchange.setProvider(provider);
                exchange.setRequestedProduct(requestedProduct);
                exchange.setOfferedProduct(offeredProduct);

                Exchange savedExchange = exchangeRepository.save(exchange);

                return mapToExchangeResponse(savedExchange);
        }

        @Transactional
        public ExchangeResponse acceptExchange(Long exchangeId, Long providerId) {
                Exchange exchange = exchangeRepository.findById(exchangeId)
                                .orElseThrow(() -> new EntityNotFoundException("Exchange not found"));

                // Validar que el usuario que acepta sea el proveedor del producto solicitado
                if (!exchange.getProvider().getId().equals(providerId)) {
                        throw new IllegalStateException("Only the provider can accept this exchange");
                }

                // Validar que el intercambio esté en estado pendiente
                if (exchange.getStatus() != ExchangeStatus.PENDING) {
                        throw new IllegalStateException("This exchange is not in a pending state");
                }

                exchange.setStatus(ExchangeStatus.ACCEPTED);
                Exchange savedExchange = exchangeRepository.save(exchange);

                return mapToExchangeResponse(savedExchange);
        }

        @Transactional
        public ExchangeResponse completeExchange(Long exchangeId, Long userId) {
                Exchange exchange = exchangeRepository.findById(exchangeId)
                                .orElseThrow(() -> new EntityNotFoundException("Exchange not found"));

                // Validar que el usuario sea el proveedor o el solicitante
                if (!exchange.getProvider().getId().equals(userId) && !exchange.getRequester().getId().equals(userId)) {
                        throw new IllegalStateException("Only participants can complete this exchange");
                }

                // Validar que el intercambio esté en estado aceptado
                if (exchange.getStatus() != ExchangeStatus.ACCEPTED) {
                        throw new IllegalStateException("This exchange is not in an accepted state");
                }

                exchange.setStatus(ExchangeStatus.COMPLETED);
                exchange.setCompletedAt(LocalDateTime.now());

                // Intercambiar la propiedad de los productos
                Product requestedProduct = exchange.getRequestedProduct();
                Product offeredProduct = exchange.getOfferedProduct();

                User requester = exchange.getRequester();
                User provider = exchange.getProvider();

                // Cambiar propietario
                requestedProduct.setUser(requester);
                offeredProduct.setUser(provider);

                // Marcar productos como intercambiados
                productService.markProductAsExchanged(requestedProduct);
                productService.markProductAsExchanged(offeredProduct);

                // Incrementar el contador de intercambios para ambos usuarios
                requester.setItemsExchanged(requester.getItemsExchanged() + 1);
                provider.setItemsExchanged(provider.getItemsExchanged() + 1);

                // Otorgar puntos a ambos usuarios (por ejemplo, 10 puntos por intercambio)
                requester.setPoints(requester.getPoints() + 10);
                provider.setPoints(provider.getPoints() + 10);

                userRepository.save(requester);
                userRepository.save(provider);

                Exchange savedExchange = exchangeRepository.save(exchange);

                return mapToExchangeResponse(savedExchange);
        }

        @Transactional
        public ExchangeResponse rejectExchange(Long exchangeId, Long providerId) {
                Exchange exchange = exchangeRepository.findById(exchangeId)
                                .orElseThrow(() -> new EntityNotFoundException("Exchange not found"));

                // Validar que el usuario que rechaza sea el proveedor
                if (!exchange.getProvider().getId().equals(providerId)) {
                        throw new IllegalStateException("Only the provider can reject this exchange");
                }

                // Validar que el intercambio esté en estado pendiente
                if (exchange.getStatus() != ExchangeStatus.PENDING) {
                        throw new IllegalStateException("This exchange is not in a pending state");
                }

                exchange.setStatus(ExchangeStatus.REJECTED);
                Exchange savedExchange = exchangeRepository.save(exchange);

                return mapToExchangeResponse(savedExchange);
        }

        @Transactional
        public ExchangeResponse cancelExchange(Long exchangeId, Long requesterId) {
                Exchange exchange = exchangeRepository.findById(exchangeId)
                                .orElseThrow(() -> new EntityNotFoundException("Exchange not found"));

                // Validar que el usuario que cancela sea el solicitante
                if (!exchange.getRequester().getId().equals(requesterId)) {
                        throw new IllegalStateException("Only the requester can cancel this exchange");
                }

                // Validar que el intercambio esté en estado pendiente o aceptado
                if (exchange.getStatus() != ExchangeStatus.PENDING && exchange.getStatus() != ExchangeStatus.ACCEPTED) {
                        throw new IllegalStateException("This exchange cannot be cancelled in its current state");
                }

                exchange.setStatus(ExchangeStatus.CANCELLED);
                Exchange savedExchange = exchangeRepository.save(exchange);

                return mapToExchangeResponse(savedExchange);
        }

        public List<ExchangeResponse> getRequestedExchanges(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                List<Exchange> exchanges = exchangeRepository.findByRequester(user);
                return exchanges.stream()
                                .map(this::mapToExchangeResponse)
                                .collect(Collectors.toList());
        }

        public List<ExchangeResponse> getProvidedExchanges(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                List<Exchange> exchanges = exchangeRepository.findByProvider(user);
                return exchanges.stream()
                                .map(this::mapToExchangeResponse)
                                .collect(Collectors.toList());
        }

        public List<Product> getAvailableProductsForExchange(Long userId, String category, String search) {
                List<Product> products = productRepository.findAll().stream()
                                .filter(product -> !product.getUser().getId().equals(userId)) // No incluir productos
                                                                                              // propios
                                .filter(Product::canBeExchanged) // Solo productos disponibles para intercambio
                                .filter(product -> category == null
                                                || product.getCategory().name().equalsIgnoreCase(category))
                                .filter(product -> search == null || search.trim().isEmpty() ||
                                                product.getProductName().toLowerCase().contains(search.toLowerCase()) ||
                                                product.getDescription().toLowerCase().contains(search.toLowerCase()))
                                .collect(Collectors.toList());

                return products;
        }

        public List<Product> getMyProductsForExchange(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                return productRepository.findByUserAndAvailableForExchangeAndStatus(user, true, ProductStatus.ACTIVE);
        }

        public ExchangeStatistics getExchangeStatistics(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                List<Exchange> requestedExchanges = exchangeRepository.findByRequester(user);
                List<Exchange> providedExchanges = exchangeRepository.findByProvider(user);

                Long totalExchanges = (long) (requestedExchanges.size() + providedExchanges.size());

                Long pendingExchanges = requestedExchanges.stream()
                                .mapToLong(e -> e.getStatus() == ExchangeStatus.PENDING ? 1 : 0)
                                .sum() +
                                providedExchanges.stream()
                                                .mapToLong(e -> e.getStatus() == ExchangeStatus.PENDING ? 1 : 0)
                                                .sum();

                Long acceptedExchanges = requestedExchanges.stream()
                                .mapToLong(e -> e.getStatus() == ExchangeStatus.ACCEPTED ? 1 : 0)
                                .sum() +
                                providedExchanges.stream()
                                                .mapToLong(e -> e.getStatus() == ExchangeStatus.ACCEPTED ? 1 : 0)
                                                .sum();

                Long completedExchanges = requestedExchanges.stream()
                                .mapToLong(e -> e.getStatus() == ExchangeStatus.COMPLETED ? 1 : 0)
                                .sum() +
                                providedExchanges.stream()
                                                .mapToLong(e -> e.getStatus() == ExchangeStatus.COMPLETED ? 1 : 0)
                                                .sum();

                Long rejectedExchanges = requestedExchanges.stream()
                                .mapToLong(e -> e.getStatus() == ExchangeStatus.REJECTED ? 1 : 0)
                                .sum() +
                                providedExchanges.stream()
                                                .mapToLong(e -> e.getStatus() == ExchangeStatus.REJECTED ? 1 : 0)
                                                .sum();

                Long cancelledExchanges = requestedExchanges.stream()
                                .mapToLong(e -> e.getStatus() == ExchangeStatus.CANCELLED ? 1 : 0)
                                .sum() +
                                providedExchanges.stream()
                                                .mapToLong(e -> e.getStatus() == ExchangeStatus.CANCELLED ? 1 : 0)
                                                .sum();

                List<Product> userProducts = productRepository.findByUserAndAvailableForExchangeAndStatus(user, true,
                                ProductStatus.ACTIVE);
                Double averageProductValue = userProducts.stream()
                                .filter(p -> p.getEstimatedValue() != null && p.getEstimatedValue() > 0)
                                .mapToDouble(Product::getEstimatedValue)
                                .average()
                                .orElse(0.0);

                return ExchangeStatistics.builder()
                                .totalExchanges(totalExchanges)
                                .pendingExchanges(pendingExchanges)
                                .acceptedExchanges(acceptedExchanges)
                                .completedExchanges(completedExchanges)
                                .rejectedExchanges(rejectedExchanges)
                                .cancelledExchanges(cancelledExchanges)
                                .totalRequestedExchanges((long) requestedExchanges.size())
                                .totalProvidedExchanges((long) providedExchanges.size())
                                .pointsEarnedFromExchanges(user.getPoints())
                                .averageProductValue(averageProductValue)
                                .build();
        }

        private ExchangeResponse mapToExchangeResponse(Exchange exchange) {
                return ExchangeResponse.builder()
                                .exchangeId(exchange.getExchangeId())
                                .requesterId(exchange.getRequester().getId())
                                .requesterName(exchange.getRequester().getFirstName() + " "
                                                + exchange.getRequester().getLastName())
                                .providerId(exchange.getProvider().getId())
                                .providerName(exchange.getProvider().getFirstName() + " "
                                                + exchange.getProvider().getLastName())
                                .requestedProductId(exchange.getRequestedProduct().getProductId())
                                .requestedProductName(exchange.getRequestedProduct().getProductName())
                                .requestedProductImage(exchange.getRequestedProduct().getImageUrl())
                                .offeredProductId(exchange.getOfferedProduct().getProductId())
                                .offeredProductName(exchange.getOfferedProduct().getProductName())
                                .offeredProductImage(exchange.getOfferedProduct().getImageUrl())
                                .requestedAt(exchange.getRequestedAt())
                                .completedAt(exchange.getCompletedAt())
                                .status(exchange.getStatus().name())
                                .build();
        }

        public List<ProductResponseDto> getAvailableProductsForExchangeAsDto(Long userId, String category,
                        String search) {
                List<Product> products = getAvailableProductsForExchange(userId, category, search);
                return products.stream()
                                .map(product -> mapProductToResponseDto(product, userId))
                                .collect(Collectors.toList());
        }

        public List<ProductResponseDto> getMyProductsForExchangeAsDto(Long userId) {
                List<Product> products = getMyProductsForExchange(userId);
                return products.stream()
                                .map(product -> mapProductToResponseDto(product, userId))
                                .collect(Collectors.toList());
        }

        private ProductResponseDto mapProductToResponseDto(Product product, Long currentUserId) {
                ProductResponseDto dto = new ProductResponseDto();
                dto.setProductId(product.getProductId());
                dto.setProductName(product.getProductName());
                dto.setDescription(product.getDescription());
                dto.setImageUrl(product.getImageUrl());
                dto.setCategory(product.getCategory());
                dto.setCondition(product.getCondition());
                dto.setStatus(product.getStatus());
                dto.setAvailableForExchange(product.isAvailableForExchange());
                dto.setExchangePreferences(product.getExchangePreferences());
                dto.setEstimatedValue(product.getEstimatedValue());
                dto.setUserId(product.getUser().getId());
                dto.setOwnerName(product.getUser().getFirstName() + " " + product.getUser().getLastName());
                dto.setCreatedAt(product.getCreatedAt());

                // Establecer si pertenece al usuario actual
                dto.setBelongsToCurrentUser(currentUserId != null && currentUserId.equals(product.getUser().getId()));

                return dto;
        }
}