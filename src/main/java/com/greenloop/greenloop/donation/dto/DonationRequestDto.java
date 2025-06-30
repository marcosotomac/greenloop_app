package com.greenloop.greenloop.donation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestDto {
    @NotNull(message = "El ID del producto es obligatorio")
    private Long productId;

    private String description;

    private String donationLocation;

    private String donorNote;
}
