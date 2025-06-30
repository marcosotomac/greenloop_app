package com.greenloop.greenloop.exchange.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExchangeStatistics {
    private Long totalExchanges;
    private Long pendingExchanges;
    private Long acceptedExchanges;
    private Long completedExchanges;
    private Long rejectedExchanges;
    private Long cancelledExchanges;
    private Long totalRequestedExchanges;
    private Long totalProvidedExchanges;
    private Integer pointsEarnedFromExchanges;
    private Double averageProductValue;
}
