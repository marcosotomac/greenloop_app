package com.greenloop.greenloop.exchange.application;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.exchange.domain.ExchangeService;
import com.greenloop.greenloop.exchange.dto.ExchangeRequest;
import com.greenloop.greenloop.exchange.dto.ExchangeResponse;
import com.greenloop.greenloop.exchange.dto.ExchangeStatistics;
import com.greenloop.greenloop.product.dto.ProductResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exchanges")
@RequiredArgsConstructor
public class ExchangeController {

    private final ExchangeService exchangeService;

    @PostMapping
    public ResponseEntity<ExchangeResponse> requestExchange(
            @RequestBody ExchangeRequest exchangeRequest,
            @AuthenticationPrincipal User user) {
        ExchangeResponse response = exchangeService.requestExchange(exchangeRequest, user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{exchangeId}/accept")
    public ResponseEntity<ExchangeResponse> acceptExchange(
            @PathVariable Long exchangeId,
            @AuthenticationPrincipal User user) {
        ExchangeResponse response = exchangeService.acceptExchange(exchangeId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{exchangeId}/complete")
    public ResponseEntity<ExchangeResponse> completeExchange(
            @PathVariable Long exchangeId,
            @AuthenticationPrincipal User user) {
        ExchangeResponse response = exchangeService.completeExchange(exchangeId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{exchangeId}/reject")
    public ResponseEntity<ExchangeResponse> rejectExchange(
            @PathVariable Long exchangeId,
            @AuthenticationPrincipal User user) {
        ExchangeResponse response = exchangeService.rejectExchange(exchangeId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{exchangeId}/cancel")
    public ResponseEntity<ExchangeResponse> cancelExchange(
            @PathVariable Long exchangeId,
            @AuthenticationPrincipal User user) {
        ExchangeResponse response = exchangeService.cancelExchange(exchangeId, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requested")
    public ResponseEntity<List<ExchangeResponse>> getRequestedExchanges(
            @AuthenticationPrincipal User user) {
        List<ExchangeResponse> exchanges = exchangeService.getRequestedExchanges(user.getId());
        return ResponseEntity.ok(exchanges);
    }

    @GetMapping("/provided")
    public ResponseEntity<List<ExchangeResponse>> getProvidedExchanges(
            @AuthenticationPrincipal User user) {
        List<ExchangeResponse> exchanges = exchangeService.getProvidedExchanges(user.getId());
        return ResponseEntity.ok(exchanges);
    }

    @GetMapping("/available-products")
    public ResponseEntity<List<ProductResponseDto>> getAvailableProductsForExchange(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<ProductResponseDto> products = exchangeService.getAvailableProductsForExchangeAsDto(user.getId(), category,
                search);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/my-products")
    public ResponseEntity<List<ProductResponseDto>> getMyProductsForExchange(
            @AuthenticationPrincipal User user) {
        List<ProductResponseDto> products = exchangeService.getMyProductsForExchangeAsDto(user.getId());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/statistics")
    public ResponseEntity<ExchangeStatistics> getExchangeStatistics(
            @AuthenticationPrincipal User user) {
        ExchangeStatistics stats = exchangeService.getExchangeStatistics(user.getId());
        return ResponseEntity.ok(stats);
    }
}
