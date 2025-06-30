package com.greenloop.greenloop.product.application;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductService;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.dto.ProductExchangeRequest;
import com.greenloop.greenloop.product.dto.ProductResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @AuthenticationPrincipal User user) {
        Product createdProduct = productService.createProduct(product, user.getId());
        return ResponseEntity.ok(createdProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductResponseDto> getProductByIdAsDto(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        ProductResponseDto product = productService.getProductByIdAsDto(id, user.getId());
        return ResponseEntity.ok(product);
    }

    @PutMapping
    public ResponseEntity<Product> updateProduct(
            @RequestBody Product product,
            @AuthenticationPrincipal User user) {
        Product updatedProduct = productService.updateProduct(product, user.getId());
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        productService.deleteProduct(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts(
            @AuthenticationPrincipal User user) {
        Long currentUserId = user != null ? user.getId() : null;
        List<ProductResponseDto> products = productService.getAllProductsAsDto(currentUserId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> getProductsByName(@RequestParam String name) {
        List<Product> products = productService.getProductsByName(name);
        return ResponseEntity.ok(products);
    }

    // Nuevos endpoints para la funcionalidad de intercambio

    @GetMapping("/exchange/available")
    public ResponseEntity<List<ProductResponseDto>> getProductsAvailableForExchange(
            @AuthenticationPrincipal User user) {
        Long currentUserId = user != null ? user.getId() : null;
        List<ProductResponseDto> products = productService.getProductsAvailableForExchangeAsDto(currentUserId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/exchange/user")
    public ResponseEntity<List<ProductResponseDto>> getUserProductsAvailableForExchange(
            @AuthenticationPrincipal User user) {
        List<ProductResponseDto> products = productService.getUserProductsAvailableForExchangeAsDto(user.getId());
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}/exchange-status")
    public ResponseEntity<Product> updateProductExchangeStatus(
            @PathVariable Long id,
            @RequestBody ProductExchangeRequest request,
            @AuthenticationPrincipal User user) {
        Product product = productService.updateProductExchangeStatus(id, user.getId(), request);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/enable-all-exchanges")
    public ResponseEntity<List<ProductResponseDto>> enableAllExchanges(
            @AuthenticationPrincipal User user) {
        List<ProductResponseDto> products = productService.enableAllUserProductsForExchange(user.getId());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}/exchange-matches")
    public ResponseEntity<List<Product>> findExchangeMatches(@PathVariable Long id) {
        List<Product> matchingProducts = productService.findExchangeMatches(id);
        return ResponseEntity.ok(matchingProducts);
    }

    // Nuevos endpoints para manejo de productos por estado

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProductResponseDto>> getProductsByStatus(
            @PathVariable ProductStatus status,
            @AuthenticationPrincipal User user) {
        Long currentUserId = user != null ? user.getId() : null;
        List<ProductResponseDto> products = productService.getProductsByStatus(status, currentUserId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/user/exchanged")
    public ResponseEntity<List<ProductResponseDto>> getUserExchangedProducts(
            @AuthenticationPrincipal User user) {
        List<ProductResponseDto> products = productService.getUserExchangedProducts(user.getId());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/user/active")
    public ResponseEntity<List<ProductResponseDto>> getUserActiveProducts(
            @AuthenticationPrincipal User user) {
        List<ProductResponseDto> products = productService.getUserActiveProducts(user.getId());
        return ResponseEntity.ok(products);
    }
}