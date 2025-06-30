package com.greenloop.greenloop.exchange.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExchangeResponse {
    private Long exchangeId;
    private Long requesterId;
    private String requesterName;
    private Long providerId;
    private String providerName;
    private Long requestedProductId;
    private String requestedProductName;
    private String requestedProductImage;
    private Long offeredProductId;
    private String offeredProductName;
    private String offeredProductImage;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private String status;

}
