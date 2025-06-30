package com.greenloop.greenloop.donation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.donation.domain.DonationService;
import com.greenloop.greenloop.donation.domain.DonationStatus;
import com.greenloop.greenloop.donation.dto.DonationRequestDto;
import com.greenloop.greenloop.donation.dto.DonationResponseDto;
import com.greenloop.greenloop.donation.dto.DonationSummaryDto;
import com.greenloop.greenloop.donation.dto.DonationUpdateDto;
import com.greenloop.greenloop.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DonationController.class)
public class DonationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DonationService donationService;

    @MockitoBean
    private JwtService jwtService;

    private DonationRequestDto donationRequestDto;
    private DonationResponseDto donationResponseDto;
    private DonationUpdateDto donationUpdateDto;
    private List<DonationSummaryDto> donationSummaries;

    @BeforeEach
    void setUp() {
        // Set up donation request DTO
        donationRequestDto = new DonationRequestDto();
        donationRequestDto.setProductId(1L);
        donationRequestDto.setDescription("Test Donation");
        donationRequestDto.setDonationLocation("Test Location");
        donationRequestDto.setDonorNote("Test Note");

        // Set up donation response DTO
        donationResponseDto = DonationResponseDto.builder()
                .id(1L)
                .title("Donación: Test Product")
                .description("Test Donation")
                .imageUrl("http://example.com/image.jpg")
                .donorId(1L)
                .donorName("John Doe")
                .productId(1L)
                .productName("Test Product")
                .donationDate("2025-05-28 10:00:00")
                .status(DonationStatus.PENDING)
                .donationLocation("Test Location")
                .donorNote("Test Note")
                .build();

        // Set up donation update DTO
        donationUpdateDto = new DonationUpdateDto();
        donationUpdateDto.setStatus(DonationStatus.CONFIRMED);
        donationUpdateDto.setReceiverNote("Test Receiver Note");

        // Set up donation summary DTOs
        DonationSummaryDto summaryDto = new DonationSummaryDto();
        summaryDto.setId(1L);
        summaryDto.setTitle("Donación: Test Product");
        summaryDto.setImageUrl("http://example.com/image.jpg");
        summaryDto.setDonorName("John Doe");
        summaryDto.setDonationDate("2025-05-28 10:00:00");
        summaryDto.setStatus(DonationStatus.PENDING);

        donationSummaries = List.of(summaryDto);
    }

    @Test
    @WithMockUser(username = "user")
    void createDonation_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(donationService.createDonation(any(DonationRequestDto.class), anyLong())).thenReturn(donationResponseDto);

        // When & Then
        mockMvc.perform(post("/api/donations")
                    .with(SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(donationRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Donación: Test Product")))
                .andExpect(jsonPath("$.description", is("Test Donation")))
                .andExpect(jsonPath("$.donorId", is(1)))
                .andExpect(jsonPath("$.status", is("PENDING")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(donationService).createDonation(any(DonationRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "user")
    void getAllAvailableDonations_Success() throws Exception {
        // Given
        when(donationService.getAllAvailableDonations()).thenReturn(donationSummaries);

        // When & Then
        mockMvc.perform(get("/api/donations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Donación: Test Product")))
                .andExpect(jsonPath("$[0].status", is("PENDING")));

        verify(donationService).getAllAvailableDonations();
    }

    @Test
    @WithMockUser(username = "user")
    void getUserDonations_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(donationService.getUserDonations(anyLong())).thenReturn(donationSummaries);

        // When & Then
        mockMvc.perform(get("/api/donations/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Donación: Test Product")))
                .andExpect(jsonPath("$[0].status", is("PENDING")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(donationService).getUserDonations(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void getDonationById_Success() throws Exception {
        // Given
        when(donationService.getDonationById(anyLong())).thenReturn(donationResponseDto);

        // When & Then
        mockMvc.perform(get("/api/donations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Donación: Test Product")))
                .andExpect(jsonPath("$.description", is("Test Donation")));

        verify(donationService).getDonationById(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void requestDonation_Success() throws Exception {
        // Given
        DonationResponseDto confirmedResponse = DonationResponseDto.builder()
                .id(1L)
                .title("Donación: Test Product")
                .donorId(1L)
                .donorName("John Doe")
                .receiverId(2L)
                .receiverName("Jane Smith")
                .status(DonationStatus.CONFIRMED)
                .build();

        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(2L);
        when(donationService.requestDonation(anyLong(), anyLong())).thenReturn(confirmedResponse);

        // When & Then
        mockMvc.perform(post("/api/donations/1/request")
                    .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.receiverId", is(2)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(donationService).requestDonation(1L, 2L);
    }

    @Test
    @WithMockUser(username = "user")
    void updateDonationStatus_Success() throws Exception {
        // Given
        DonationResponseDto updatedResponse = DonationResponseDto.builder()
                .id(1L)
                .title("Donación: Test Product")
                .status(DonationStatus.CONFIRMED)
                .receiverNote("Test Receiver Note")
                .build();

        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(2L);
        when(donationService.updateDonationStatus(anyLong(), any(DonationUpdateDto.class), anyLong())).thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/donations/1")
                    .with(SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(donationUpdateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.receiverNote", is("Test Receiver Note")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(donationService).updateDonationStatus(eq(1L), any(DonationUpdateDto.class), eq(2L));
    }
}
