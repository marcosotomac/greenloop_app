package com.greenloop.greenloop.product.domain;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.product.dto.ProductExchangeRequest;
import com.greenloop.greenloop.product.dto.ProductResponseDto;
import com.greenloop.greenloop.product.exceptions.ProductAuthorizationException;
import com.greenloop.greenloop.product.exceptions.ProductNotFoundException;
import com.greenloop.greenloop.product.exceptions.UserNotFoundException;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import com.greenloop.greenloop.wishlist.domain.WishListService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    private WishListService wishListService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ProductResponseDto updateProductStatus(Long productId, ProductStatus newStatus) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Producto no encontrado con id: " + productId));

        // Actualizar el estado
        product.setStatus(newStatus);
        Product savedProduct = productRepository.save(product);

        // Notificar a los usuarios que tienen este producto en su lista de deseos
        wishListService.notifyProductStatusChange(savedProduct);

        return mapToResponseDto(savedProduct);
    }

    @Transactional
    public Product createProduct(Product product, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        product.setUser(user);
        Product savedProduct = productRepository.save(product);

        // Notificar que se ha creado un nuevo producto
        try {
            notificationService.notifyProductCreated(
                    userId,
                    savedProduct.getProductId(),
                    savedProduct.getProductName());
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Error al enviar notificación de producto creado: " + e.getMessage());
        }

        return savedProduct;
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductByIdAsDto(Long id, Long currentUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        return mapToResponseDto(product, currentUserId);
    }

    private ProductResponseDto mapToResponseDto(Product product) {
        return mapToResponseDto(product, null);
    }

    private ProductResponseDto mapToResponseDto(Product product, Long currentUserId) {
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

    @Transactional
    public Product updateProduct(Product product, Long userId) {
        Product existingProduct = productRepository.findById(product.getProductId())
                .orElseThrow(
                        () -> new ProductNotFoundException("Product not found with id: " + product.getProductId()));

        // Verificar que el usuario es el propietario del producto
        if (!existingProduct.getUser().getId().equals(userId)) {
            throw new ProductAuthorizationException("You can only update your own products");
        }

        // Actualizar propiedades
        existingProduct.setProductName(product.getProductName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setCondition(product.getCondition());
        existingProduct.setAvailableForExchange(product.isAvailableForExchange());
        existingProduct.setExchangePreferences(product.getExchangePreferences());
        existingProduct.setEstimatedValue(product.getEstimatedValue());

        return productRepository.save(existingProduct);
    }

    @Transactional
    public void deleteProduct(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        // Verificar que el usuario es el propietario del producto
        if (!product.getUser().getId().equals(userId)) {
            throw new ProductAuthorizationException("You can only delete your own products");
        }

        productRepository.deleteById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByName(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name);
    }

    // Nuevos métodos para la funcionalidad de intercambio

    public List<Product> getProductsAvailableForExchange() {
        return productRepository.findByAvailableForExchangeAndStatus(true, ProductStatus.ACTIVE);
    }

    public List<Product> getUserProductsAvailableForExchange(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return productRepository.findByUserAndAvailableForExchangeAndStatus(user, true, ProductStatus.ACTIVE);
    }

    @Transactional
    public Product updateProductExchangeStatus(Long productId, Long userId, ProductExchangeRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        // Verificar que el usuario es el propietario del producto
        if (!product.getUser().getId().equals(userId)) {
            throw new ProductAuthorizationException("You can only update your own products");
        }

        product.setAvailableForExchange(request.isAvailableForExchange());
        product.setExchangePreferences(request.getExchangePreferences());
        product.setEstimatedValue(request.getEstimatedValue());

        return productRepository.save(product);
    }

    @Transactional
    public void markProductAsExchanged(Product product) {
        product.setStatus(ProductStatus.EXCHANGED);
        product.setAvailableForExchange(false);
        productRepository.save(product);
    }

    @Transactional
    public List<ProductResponseDto> enableAllUserProductsForExchange(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Obtener todos los productos del usuario que estén activos
        List<Product> userProducts = productRepository.findByUser(user);

        // Filtrar solo productos activos y activar intercambio
        for (Product product : userProducts) {
            if (product.getStatus() == ProductStatus.ACTIVE) {
                product.setAvailableForExchange(true);
            }
        }

        // Guardar todos los productos actualizados
        List<Product> updatedProducts = productRepository.saveAll(userProducts);

        // Convertir a DTO y retornar
        return updatedProducts.stream()
                .map(product -> {
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
                    dto.setBelongsToCurrentUser(true); // Siempre true para productos del usuario
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Método para buscar productos compatibles para intercambio
    public List<Product> findExchangeMatches(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        // Ejemplo básico: buscar productos de valor similar y misma categoría
        Double minValue = product.getEstimatedValue() * 0.8;
        Double maxValue = product.getEstimatedValue() * 1.2;

        return productRepository.findByAvailableForExchangeAndStatusAndCategoryAndEstimatedValueBetween(
                true, ProductStatus.ACTIVE, product.getCategory(), minValue, maxValue);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProductsAsDto(Long currentUserId) {
        // Filtrar productos para excluir intercambiados, donados e inactivos
        List<ProductStatus> excludedStatuses = List.of(
                ProductStatus.EXCHANGED,
                ProductStatus.DONATED,
                ProductStatus.INACTIVE);
        List<Product> products = productRepository.findByStatusNotIn(excludedStatuses);
        return products.stream()
                .map(product -> mapToResponseDto(product, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsAvailableForExchangeAsDto(Long currentUserId) {
        // Solo productos activos y disponibles para intercambio
        List<Product> products = productRepository.findByAvailableForExchangeAndStatus(true, ProductStatus.ACTIVE);
        return products.stream()
                .map(product -> mapToResponseDto(product, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getUserProductsAvailableForExchangeAsDto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        // Solo productos activos del usuario disponibles para intercambio
        List<Product> products = productRepository.findByUserAndAvailableForExchangeAndStatus(
                user, true, ProductStatus.ACTIVE);
        return products.stream()
                .map(product -> mapToResponseDto(product, userId))
                .toList();
    }

    /**
     * Simula cuando alguien le da like a un producto
     */
    @Transactional
    public void likeProduct(Long productId, Long likerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        User liker = userRepository.findById(likerId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + likerId));

        // Solo notificar si no es el mismo usuario
        if (!product.getUser().getId().equals(likerId)) {
            try {
                notificationService.notifyProductLiked(
                        product.getUser().getId(),
                        likerId,
                        productId,
                        product.getProductName(),
                        liker.getFirstName() + " " + liker.getLastName());
            } catch (Exception e) {
                System.err.println("Error al enviar notificación de like: " + e.getMessage());
            }
        }
    }

    /**
     * Simula cuando alguien comenta en un producto
     */
    @Transactional
    public void commentOnProduct(Long productId, Long commenterId, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        User commenter = userRepository.findById(commenterId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + commenterId));

        // Solo notificar si no es el mismo usuario
        if (!product.getUser().getId().equals(commenterId)) {
            try {
                notificationService.notifyProductCommented(
                        product.getUser().getId(),
                        commenterId,
                        productId,
                        product.getProductName(),
                        commenter.getFirstName() + " " + commenter.getLastName());
            } catch (Exception e) {
                System.err.println("Error al enviar notificación de comentario: " + e.getMessage());
            }
        }
    }

    // Nuevos métodos para manejar productos por estado

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsByStatus(ProductStatus status, Long currentUserId) {
        List<Product> products = productRepository.findByStatus(status);
        return products.stream()
                .map(product -> mapToResponseDto(product, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getUserExchangedProducts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<Product> products = productRepository.findByUser(user).stream()
                .filter(product -> product.getStatus() == ProductStatus.EXCHANGED)
                .toList();
        return products.stream()
                .map(product -> mapToResponseDto(product, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getUserActiveProducts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<Product> products = productRepository.findByUser(user).stream()
                .filter(product -> product.getStatus() == ProductStatus.ACTIVE)
                .toList();
        return products.stream()
                .map(product -> mapToResponseDto(product, userId))
                .toList();
    }
}
