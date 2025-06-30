package com.greenloop.greenloop.wishlist.dto;

import java.util.List;

import com.greenloop.greenloop.product.domain.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishListSummaryDto {
    private Long id;
    private String name;
    private String description;
    private int productCount;
    private boolean isPublic;
    private List<Category> desiredCategories;
    private String createdAt;
}
