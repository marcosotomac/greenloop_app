package com.greenloop.greenloop.product.exceptions;

public class ProductAuthorizationException extends RuntimeException {
    public ProductAuthorizationException(String message) {
        super(message);
    }

    public ProductAuthorizationException(Long userId, Long productId) {
        super("User with id: " + userId + " is not authorized to modify product with id: " + productId);
    }
}
