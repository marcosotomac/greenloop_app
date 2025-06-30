package com.greenloop.greenloop.donation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationStatisticsDto {
    private Long totalDonationsGiven;
    private Long totalDonationsReceived;
    private Integer totalPointsEarned;
    private Long activeDonations;
    private Long completedDonations;
    private Long pendingRequests;
}
