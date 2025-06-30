package com.greenloop.greenloop.donation.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.donation.dto.DonationRequestDto;
import com.greenloop.greenloop.donation.dto.DonationResponseDto;
import com.greenloop.greenloop.donation.dto.DonationUpdateDto;
import com.greenloop.greenloop.donation.infrastucture.DonationRepository;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DonationServiceTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DonationService donationService;

    private User donor;
    private User receiver;
    private Product product;
    private Donation donation;
    private DonationRequestDto donationRequestDto;
    private DonationUpdateDto donationUpdateDto;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final LocalDateTime now = LocalDateTime.now();

    @BeforeEach
    void setUp() {
        // Set up test donor
        donor = new User();
        donor.setId(1L);
        donor.setFirstName("John");
        donor.setLastName("Doe");
        donor.setEmail("john.doe@example.com");
        donor.setPoints(0);
        donor.setItemsDonated(0);
        donor.setRole(Role.USER);

        // Set up test receiver
        receiver = new User();
        receiver.setId(2L);
        receiver.setFirstName("Jane");
        receiver.setLastName("Smith");
        receiver.setEmail("jane.smith@example.com");
        receiver.setPoints(0);
        receiver.setItemsDonated(0);
        receiver.setRole(Role.USER);

        // Set up test product
        product = new Product();
        product.setProductId(1L);
        product.setProductName("Test Product");
        product.setDescription("Test Description");
        product.setImageUrl("http://example.com/image.jpg");
        product.setStatus(ProductStatus.ACTIVE);
        product.setUser(donor);

        // Set up test donation - Make sure donationDate is initialized
        donation = new Donation();
        donation.setId(1L);
        donation.setTitle("Donación: Test Product");
        donation.setDescription("Test Description");
        donation.setImageUrl("http://example.com/image.jpg");
        donation.setDonor(donor);
        donation.setProduct(product);
        donation.setStatus(DonationStatus.PENDING);
        donation.setDonationDate(now); // Ensure this is set
        donation.setDonationLocation("Test Location");
        donation.setDonorNote("Test Donor Note");

        // Set up test request DTO
        donationRequestDto = new DonationRequestDto();
        donationRequestDto.setProductId(1L);
        donationRequestDto.setDescription("Test Description");
        donationRequestDto.setDonationLocation("Test Location");
        donationRequestDto.setDonorNote("Test Donor Note");

        // Set up test update DTO
        donationUpdateDto = new DonationUpdateDto();
        donationUpdateDto.setStatus(DonationStatus.CONFIRMED);
        donationUpdateDto.setReceiverNote("Test Receiver Note");
    }

    @Test
    void createDonation_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(donor));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(product));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);

        // When
        DonationResponseDto result = donationService.createDonation(donationRequestDto, donor.getId());

        // Then
        assertNotNull(result);
        assertEquals(donation.getId(), result.getId());
        assertEquals(donation.getTitle(), result.getTitle());
        assertEquals(donation.getDescription(), result.getDescription());
        assertEquals(donation.getImageUrl(), result.getImageUrl());
        assertEquals(donation.getDonor().getId(), result.getDonorId());
        assertEquals("John Doe", result.getDonorName());
        assertEquals(donation.getProduct().getProductId(), result.getProductId());
        assertEquals(donation.getProduct().getProductName(), result.getProductName());
        assertEquals(DonationStatus.PENDING, result.getStatus());

        // Verify repository calls
        verify(userRepository).findById(donor.getId());
        verify(productRepository).findById(product.getProductId());

        // Verify product status update
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertEquals(ProductStatus.DONATED, productCaptor.getValue().getStatus());

        // Verify donation save
        verify(donationRepository).save(any(Donation.class));
    }

    @Test
    void createDonation_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            donationService.createDonation(donationRequestDto, donor.getId());
        });

        assertEquals("Donador no encontrado", exception.getMessage());
        verify(userRepository).findById(donor.getId());
        verify(productRepository, never()).findById(anyLong());
        verify(donationRepository, never()).save(any(Donation.class));
    }

    @Test
    void createDonation_ProductNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(donor));
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            donationService.createDonation(donationRequestDto, donor.getId());
        });

        assertEquals("Producto no encontrado", exception.getMessage());
        verify(userRepository).findById(donor.getId());
        verify(productRepository).findById(product.getProductId());
        verify(donationRepository, never()).save(any(Donation.class));
    }

    @Test
    void createDonation_ProductNotOwnedByDonor_ThrowsException() {
        // Given
        User otherUser = new User();
        otherUser.setId(3L);

        Product productOwnedByOther = new Product();
        productOwnedByOther.setProductId(1L);
        productOwnedByOther.setUser(otherUser);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(donor));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(productOwnedByOther));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.createDonation(donationRequestDto, donor.getId());
        });

        assertEquals("No puedes donar un producto que no te pertenece", exception.getMessage());
    }

    @Test
    void createDonation_ProductNotActive_ThrowsException() {
        // Given
        Product inactiveProduct = new Product();
        inactiveProduct.setProductId(1L);
        inactiveProduct.setUser(donor);
        inactiveProduct.setStatus(ProductStatus.DONATED);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(donor));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(inactiveProduct));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.createDonation(donationRequestDto, donor.getId());
        });

        assertEquals("El producto no está disponible para donación", exception.getMessage());
    }

    @Test
    void getAllAvailableDonations_Success() {
        // Given
        List<Donation> donations = Collections.singletonList(donation);
        when(donationRepository.findByStatus(DonationStatus.PENDING)).thenReturn(donations);

        // When
        var result = donationService.getAllAvailableDonations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(donation.getId(), result.get(0).getId());
        assertEquals(donation.getTitle(), result.get(0).getTitle());
        assertEquals(donation.getDonationDate().format(formatter), result.get(0).getDonationDate());
        verify(donationRepository).findByStatus(DonationStatus.PENDING);
    }

    @Test
    void getUserDonations_Success() {
        // Given
        List<Donation> donations = Collections.singletonList(donation);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(donor));
        when(donationRepository.findByDonorOrReceiver(donor)).thenReturn(donations);

        // When
        var result = donationService.getUserDonations(donor.getId());

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(donation.getId(), result.get(0).getId());
        assertEquals(donation.getTitle(), result.get(0).getTitle());
        verify(userRepository).findById(donor.getId());
        verify(donationRepository).findByDonorOrReceiver(donor);
    }

    @Test
    void getDonationById_Success() {
        // Given
        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        // When
        var result = donationService.getDonationById(donation.getId());

        // Then
        assertNotNull(result);
        assertEquals(donation.getId(), result.getId());
        assertEquals(donation.getTitle(), result.getTitle());
        verify(donationRepository).findById(donation.getId());
    }

    @Test
    void getDonationById_NotFound_ThrowsException() {
        // Given
        when(donationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            donationService.getDonationById(99L);
        });

        assertEquals("Donación no encontrada", exception.getMessage());
        verify(donationRepository).findById(99L);
    }

    @Test
    void requestDonation_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(receiver));
        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        Donation confirmedDonation = new Donation();
        confirmedDonation.setId(donation.getId());
        confirmedDonation.setTitle(donation.getTitle());
        confirmedDonation.setDescription(donation.getDescription());
        confirmedDonation.setImageUrl(donation.getImageUrl());
        confirmedDonation.setDonor(donation.getDonor());
        confirmedDonation.setReceiver(receiver);
        confirmedDonation.setProduct(donation.getProduct());
        confirmedDonation.setStatus(DonationStatus.CONFIRMED);
        confirmedDonation.setDonationDate(donation.getDonationDate());

        when(donationRepository.save(any(Donation.class))).thenReturn(confirmedDonation);

        // When
        var result = donationService.requestDonation(donation.getId(), receiver.getId());

        // Then
        assertNotNull(result);
        assertEquals(donation.getId(), result.getId());
        assertEquals(receiver.getId(), result.getReceiverId());
        assertEquals(DonationStatus.CONFIRMED, result.getStatus());

        // Verify update
        ArgumentCaptor<Donation> donationCaptor = ArgumentCaptor.forClass(Donation.class);
        verify(donationRepository).save(donationCaptor.capture());

        Donation captured = donationCaptor.getValue();
        assertEquals(receiver.getId(), captured.getReceiver().getId());
        assertEquals(DonationStatus.CONFIRMED, captured.getStatus());

        // Verify notification
        verify(notificationService).createNotification(
                eq(donor.getId()),
                eq("Solicitud de donación"),
                anyString()
        );
    }

    @Test
    void requestDonation_DonationNotPending_ThrowsException() {
        // Given
        donation.setStatus(DonationStatus.CONFIRMED);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(receiver));
        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.requestDonation(donation.getId(), receiver.getId());
        });

        assertEquals("Esta donación ya no está disponible", exception.getMessage());
    }

    @Test
    void requestDonation_SelfDonation_ThrowsException() {
        // Given
        when(userRepository.findById(donor.getId())).thenReturn(Optional.of(donor));
        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.requestDonation(donation.getId(), donor.getId());
        });

        assertEquals("No puedes solicitar tu propia donación", exception.getMessage());
    }

    @Test
    void updateDonationStatus_CompleteByReceiver_Success() {
        // Given
        donation.setReceiver(receiver);
        donation.setStatus(DonationStatus.CONFIRMED);

        DonationUpdateDto updateDto = new DonationUpdateDto();
        updateDto.setStatus(DonationStatus.COMPLETED);
        updateDto.setReceiverNote("Donation received, thank you!");

        Donation completedDonation = new Donation();
        completedDonation.setId(donation.getId());
        completedDonation.setDonor(donation.getDonor());
        completedDonation.setReceiver(donation.getReceiver());
        completedDonation.setProduct(donation.getProduct());
        completedDonation.setStatus(DonationStatus.COMPLETED);
        completedDonation.setReceiverNote(updateDto.getReceiverNote());
        completedDonation.setDonationDate(donation.getDonationDate());
        completedDonation.setReceivedDate(now);
        completedDonation.setPointsAwarded(50); // Default donation points

        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(completedDonation);

        // When
        var result = donationService.updateDonationStatus(donation.getId(), updateDto, receiver.getId());

        // Then
        assertNotNull(result);
        assertEquals(donation.getId(), result.getId());
        assertEquals(DonationStatus.COMPLETED, result.getStatus());
        assertEquals(updateDto.getReceiverNote(), result.getReceiverNote());
        assertEquals(50, result.getPointsAwarded());

        // Verify donor points update
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User updatedDonor = userCaptor.getValue();
        assertEquals(50, updatedDonor.getPoints());
        assertEquals(1, updatedDonor.getItemsDonated());

        // Verify notification
        verify(notificationService).createNotification(
                eq(donor.getId()),
                eq("Donación completada"),
                anyString()
        );
    }

    @Test
    void updateDonationStatus_CancelByDonor_Success() {
        // Given
        DonationUpdateDto updateDto = new DonationUpdateDto();
        updateDto.setStatus(DonationStatus.CANCELLED);

        Donation cancelledDonation = new Donation();
        cancelledDonation.setId(donation.getId());
        cancelledDonation.setDonor(donation.getDonor());
        cancelledDonation.setProduct(donation.getProduct());
        cancelledDonation.setStatus(DonationStatus.CANCELLED);
        cancelledDonation.setDonationDate(now); // Ensure this is set
        cancelledDonation.setTitle(donation.getTitle());
        cancelledDonation.setDescription(donation.getDescription());

        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(cancelledDonation);

        // When
        var result = donationService.updateDonationStatus(donation.getId(), updateDto, donor.getId());

        // Then
        assertNotNull(result);
        assertEquals(donation.getId(), result.getId());
        assertEquals(DonationStatus.CANCELLED, result.getStatus());

        // Verify product status update
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertEquals(ProductStatus.ACTIVE, productCaptor.getValue().getStatus());
    }

    @Test
    void updateDonationStatus_Unauthorized_ThrowsException() {
        // Given
        User unauthorizedUser = new User();
        unauthorizedUser.setId(3L);

        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.updateDonationStatus(donation.getId(), donationUpdateDto, unauthorizedUser.getId());
        });

        assertEquals("No tienes permisos para actualizar esta donación", exception.getMessage());
    }

    @Test
    void updateDonationStatus_InvalidTransition_ThrowsException() {
        // Given
        donation.setStatus(DonationStatus.COMPLETED);

        DonationUpdateDto invalidUpdateDto = new DonationUpdateDto();
        invalidUpdateDto.setStatus(DonationStatus.CANCELLED);

        when(donationRepository.findById(anyLong())).thenReturn(Optional.of(donation));

        // When & Then
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            donationService.updateDonationStatus(donation.getId(), invalidUpdateDto, donor.getId());
        });

        assertEquals("Una donación completada no puede cambiar de estado", exception.getMessage());
    }
}
