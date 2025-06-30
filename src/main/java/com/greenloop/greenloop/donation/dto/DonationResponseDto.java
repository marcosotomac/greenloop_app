package com.greenloop.greenloop.donation.dto;

import com.greenloop.greenloop.donation.domain.DonationStatus;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponseDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Long donorId;
    private String donorName;
    private Long receiverId;
    private String receiverName;
    private Long productId;
    private String productName;
    private String donationDate;
    private String receivedDate;
    private DonationStatus status;
    private String donationLocation;
    private String receiverNote;
    private String donorNote;
    private Integer pointsAwarded;
}
