package com.greenloop.greenloop.product.dto;

import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.product.domain.Condition;
import com.greenloop.greenloop.product.domain.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private Long productId;
    private String ownerName;
    private String productName;
    private String description;
    private String imageUrl;
    private Category category;
    private Condition condition;
    private boolean availableForExchange;
    private String exchangePreferences;
    private Double estimatedValue;
    private LocalDateTime createdAt;
    private ProductStatus status;
    private Long userId;

    private boolean belongsToCurrentUser;
    private boolean inWishList;
}