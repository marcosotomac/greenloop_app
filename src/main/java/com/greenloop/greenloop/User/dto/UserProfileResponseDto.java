package com.greenloop.greenloop.User.dto;

import java.time.ZonedDateTime;
import java.util.List;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.community.dto.CommunityDto;
import com.greenloop.greenloop.wishlist.dto.WishListSummaryDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String description;
    private ZonedDateTime joinedAt;
    private Integer points;
    private String level;
    private Integer itemsDonated;
    private Integer itemsExchanged;
    private Role role;

    // Colecciones relacionadas
    private List<CommunityDto> communities;
    private List<WishListSummaryDto> wishLists;

    // Estadísticas adicionales que podrían ser útiles
    private int totalProductsCount;
    private int totalPostsCount;
}