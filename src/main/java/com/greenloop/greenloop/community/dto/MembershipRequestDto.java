package com.greenloop.greenloop.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipRequestDto {

    @Size(max = 500, message = "El mensaje no puede exceder 500 caracteres")
    private String message; // Mensaje opcional del usuario
}
