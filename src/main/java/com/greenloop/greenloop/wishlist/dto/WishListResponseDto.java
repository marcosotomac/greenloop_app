package com.greenloop.greenloop.wishlist.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.greenloop.greenloop.product.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishListResponseDto {
    private Long id;
    private String name;
    private String description;
    private List<Category> desiredCategories;
    private List<ProductSummaryDto> products;
    private String createdAt;
    private String updatedAt;

    @JsonProperty("isPublic")
    private boolean isPublic;

    private int productCount;
}
