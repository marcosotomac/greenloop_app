package com.greenloop.greenloop.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyActivityDto {
    private String month;
    private Long value;
    private String displayMonth; // Para mostrar en el frontend
}
