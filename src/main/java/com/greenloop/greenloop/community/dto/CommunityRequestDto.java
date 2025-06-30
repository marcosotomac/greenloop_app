package com.greenloop.greenloop.community.dto;

import com.greenloop.greenloop.community.domain.CommunityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunityRequestDto {
    @NotBlank(message = "El nombre de la comunidad es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre debe tener entre 3 y 50 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    private String description;

    @Builder.Default
    private CommunityType type = CommunityType.PUBLIC; // Por defecto es pública

}
