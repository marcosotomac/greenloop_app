package com.greenloop.greenloop.exchange.dto;


import lombok.Data;

@Data
public class ExchangeRequest {
    private Long requestedProductId;
    private Long offeredProductId;
}
