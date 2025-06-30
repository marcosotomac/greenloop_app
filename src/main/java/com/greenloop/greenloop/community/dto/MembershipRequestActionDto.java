package com.greenloop.greenloop.community.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipRequestActionDto {

    @NotNull(message = "La acción es requerida")
    private Boolean approved; // true = aprobar, false = rechazar

    @Size(max = 500, message = "El mensaje no puede exceder 500 caracteres")
    private String responseMessage; // Mensaje opcional del creador
}
