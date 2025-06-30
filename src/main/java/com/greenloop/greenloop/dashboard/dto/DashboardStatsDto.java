package com.greenloop.greenloop.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Long totalUsers;
    private Long totalProducts;
    private Long totalExchanges;
    private Long totalDonations;
    private Long totalCommunities;
    private Double wasteAvoided; // en kg
    private Double growthPercentage;
    private Long activeUsers;
}
