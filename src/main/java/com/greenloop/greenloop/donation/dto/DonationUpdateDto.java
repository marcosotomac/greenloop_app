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
public class DonationUpdateDto {
    private DonationStatus status;
    private String receiverNote;
    private String donationLocation;
}
