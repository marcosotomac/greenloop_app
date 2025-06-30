package com.greenloop.greenloop.donation.dto;

import com.greenloop.greenloop.donation.domain.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationSummaryDto {
    private Long id;
    private String title;
    private String imageUrl;
    private String donorName;
    private String receiverName;
    private String donationDate;
    private DonationStatus status;
    private Integer pointsAwarded;
}

