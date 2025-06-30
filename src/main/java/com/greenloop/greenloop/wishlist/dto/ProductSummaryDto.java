package com.greenloop.greenloop.wishlist.dto;

import com.greenloop.greenloop.product.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDto {
    private Long id;
    private String name;
    private String imageUrl;
    private Category category;
    private double estimatedValue;
}

