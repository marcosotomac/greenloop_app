package com.greenloop.greenloop.product.exceptions;

public class ProductExchangeException extends RuntimeException {
    public ProductExchangeException(String message) {
        super(message);
    }

    public ProductExchangeException(Long productId) {
        super("Unable to process exchange for product with id: " + productId);
    }
}
