package com.greenloop.greenloop.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponseDto {
    private String response;
    private String status;
    private String model;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}