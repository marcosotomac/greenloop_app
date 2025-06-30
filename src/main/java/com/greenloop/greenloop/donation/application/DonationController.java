package com.greenloop.greenloop.donation.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.donation.domain.DonationService;
import com.greenloop.greenloop.donation.dto.DonationRequestDto;
import com.greenloop.greenloop.donation.dto.DonationResponseDto;
import com.greenloop.greenloop.donation.dto.DonationStatisticsDto;
import com.greenloop.greenloop.donation.dto.DonationSummaryDto;
import com.greenloop.greenloop.donation.dto.DonationUpdateDto;
import com.greenloop.greenloop.jwt.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    public ResponseEntity<DonationResponseDto> createDonation(
            @Valid @RequestBody DonationRequestDto requestDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        DonationResponseDto responseDto = donationService.createDonation(requestDto, userId);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DonationSummaryDto>> getAllAvailableDonations() {
        List<DonationSummaryDto> donations = donationService.getAllAvailableDonations();
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/user")
    public ResponseEntity<List<DonationSummaryDto>> getUserDonations(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<DonationSummaryDto> donations = donationService.getUserDonations(userId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponseDto> getDonationById(@PathVariable Long id) {
        DonationResponseDto donation = donationService.getDonationById(id);
        return ResponseEntity.ok(donation);
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<DonationResponseDto> requestDonation(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        DonationResponseDto responseDto = donationService.requestDonation(id, userId);
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationResponseDto> updateDonationStatus(
            @PathVariable Long id,
            @Valid @RequestBody DonationUpdateDto updateDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        DonationResponseDto responseDto = donationService.updateDonationStatus(id, updateDto, userId);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/statistics")
    public ResponseEntity<DonationStatisticsDto> getUserDonationStatistics(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        DonationStatisticsDto statistics = donationService.getUserDonationStatistics(userId);
        return ResponseEntity.ok(statistics);
    }
}