package com.greenloop.greenloop.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequestDto {
    private String message;
    private String context;
    private String userId;
    private String sessionId;
}