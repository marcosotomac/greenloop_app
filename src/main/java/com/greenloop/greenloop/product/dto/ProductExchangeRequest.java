package com.greenloop.greenloop.product.dto;

import lombok.Data;

@Data
public class ProductExchangeRequest {
    private boolean availableForExchange;
    private String exchangePreferences;
    private Double estimatedValue;
}
