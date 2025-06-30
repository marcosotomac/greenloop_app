package com.greenloop.greenloop.donation.domain;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.donation.dto.DonationRequestDto;
import com.greenloop.greenloop.donation.dto.DonationResponseDto;
import com.greenloop.greenloop.donation.dto.DonationStatisticsDto;
import com.greenloop.greenloop.donation.dto.DonationSummaryDto;
import com.greenloop.greenloop.donation.dto.DonationUpdateDto;
import com.greenloop.greenloop.donation.infrastucture.DonationRepository;
import com.greenloop.greenloop.notification.domain.NotificationEvent;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.notification.domain.NotificationType;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Puntos que se otorgan por donación
    private static final int DONATION_POINTS = 50;

    @Transactional
    public DonationResponseDto createDonation(DonationRequestDto requestDto, Long donorId) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new EntityNotFoundException("Donador no encontrado"));

        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

        // Validar que el producto pertenezca al donador
        if (!product.getUser().getId().equals(donorId)) {
            throw new IllegalArgumentException("No puedes donar un producto que no te pertenece");
        }

        // Validar que el producto esté activo
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("El producto no está disponible para donación");
        }

        // Crear la donación
        Donation donation = new Donation();
        donation.setTitle("Donación: " + product.getProductName());
        donation.setDescription(requestDto.getDescription());
        donation.setImageUrl(product.getImageUrl());
        donation.setDonor(donor);
        donation.setProduct(product);
        donation.setStatus(DonationStatus.PENDING);
        donation.setDonationLocation(requestDto.getDonationLocation());
        donation.setDonorNote(requestDto.getDonorNote());

        // Actualizar el estado del producto
        product.setStatus(ProductStatus.DONATED);
        productRepository.save(product);

        // Guardar la donación
        Donation savedDonation = donationRepository.save(donation);

        return mapToResponseDto(savedDonation);
    }

    @Transactional(readOnly = true)
    public List<DonationSummaryDto> getAllAvailableDonations() {
        return donationRepository.findByStatus(DonationStatus.PENDING).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationSummaryDto> getUserDonations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return donationRepository.findByDonorOrReceiver(user).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DonationResponseDto getDonationById(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new EntityNotFoundException("Donación no encontrada"));

        return mapToResponseDto(donation);
    }

    @Transactional
    public DonationResponseDto requestDonation(Long donationId, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new EntityNotFoundException("Solicitante no encontrado"));

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new EntityNotFoundException("Donación no encontrada"));

        // Validar que la donación esté pendiente
        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new IllegalArgumentException("Esta donación ya no está disponible");
        }

        // Validar que el solicitante no sea el donador
        if (donation.getDonor().getId().equals(requesterId)) {
            throw new IllegalArgumentException("No puedes solicitar tu propia donación");
        }

        // Actualizar la donación
        donation.setReceiver(requester);
        donation.setStatus(DonationStatus.CONFIRMED);

        Donation updatedDonation = donationRepository.save(donation);

        // Notificar al donador
        notificationService.createNotification(
                donation.getDonor().getId(),
                "Solicitud de donación",
                "Tu donación " + donation.getTitle() + " ha sido solicitada por " + requester.getFirstName() + " "
                        + requester.getLastName());

        return mapToResponseDto(updatedDonation);
    }

    @Transactional
    public DonationResponseDto updateDonationStatus(Long donationId, DonationUpdateDto updateDto, Long userId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new EntityNotFoundException("Donación no encontrada"));

        // Validar que el usuario sea el donador o el receptor
        boolean isDonor = donation.getDonor().getId().equals(userId);
        boolean isReceiver = donation.getReceiver() != null && donation.getReceiver().getId().equals(userId);

        if (!isDonor && !isReceiver) {
            throw new IllegalArgumentException("No tienes permisos para actualizar esta donación");
        }

        // Validar la transición de estado
        validateStatusTransition(donation.getStatus(), updateDto.getStatus(), isDonor, isReceiver);

        // Actualizar la donación
        donation.setStatus(updateDto.getStatus());

        if (isReceiver && updateDto.getReceiverNote() != null) {
            donation.setReceiverNote(updateDto.getReceiverNote());
        }

        if (isDonor && updateDto.getDonationLocation() != null) {
            donation.setDonationLocation(updateDto.getDonationLocation());
        }

        // Si la donación se completa, otorgar puntos y actualizar la fecha de recepción
        if (updateDto.getStatus() == DonationStatus.COMPLETED) {
            donation.setReceivedDate(LocalDateTime.now());
            donation.setPointsAwarded(DONATION_POINTS);

            // Actualizar los puntos del donador
            User donor = donation.getDonor();
            Integer currentPoints = donor.getPoints() != null ? donor.getPoints() : 0;
            donor.setPoints(currentPoints + DONATION_POINTS);

            // Actualizar contador de items donados
            Integer itemsDonated = donor.getItemsDonated() != null ? donor.getItemsDonated() : 0;
            donor.setItemsDonated(itemsDonated + 1);

            userRepository.save(donor);

            // Notificar al donador
            notificationService.createNotification(
                    donation.getDonor().getId(),
                    "Donación completada",
                    "Tu donación " + donation.getTitle() + " ha sido recibida. ¡Has ganado " + DONATION_POINTS
                            + " puntos!");
        }

        // Si la donación se cancela, volver a poner el producto como activo
        if (updateDto.getStatus() == DonationStatus.CANCELLED) {
            Product product = donation.getProduct();
            product.setStatus(ProductStatus.ACTIVE);
            productRepository.save(product);

            // Notificar a las partes involucradas
            if (donation.getReceiver() != null) {
                notificationService.createNotification(
                        donation.getReceiver().getId(),
                        "Donación cancelada",
                        "La donación " + donation.getTitle() + " ha sido cancelada");
            }
        }

        Donation updatedDonation = donationRepository.save(donation);

        return mapToResponseDto(updatedDonation);
    }

    @Transactional(readOnly = true)
    public DonationStatisticsDto getUserDonationStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Long totalDonationsGiven = donationRepository.countDonationsByDonor(user);
        Long totalDonationsReceived = donationRepository.countReceivedDonationsByUser(user);
        Integer totalPointsEarned = donationRepository.sumPointsEarnedByUser(user);
        Long activeDonations = donationRepository.findByDonor(user).stream()
                .filter(d -> d.getStatus() == DonationStatus.PENDING || d.getStatus() == DonationStatus.CONFIRMED)
                .count();
        Long completedDonations = donationRepository.countCompletedDonationsByDonor(user);
        Long pendingRequests = donationRepository.countPendingRequestsByUser(user);

        return DonationStatisticsDto.builder()
                .totalDonationsGiven(totalDonationsGiven)
                .totalDonationsReceived(totalDonationsReceived)
                .totalPointsEarned(totalPointsEarned != null ? totalPointsEarned : 0)
                .activeDonations(activeDonations)
                .completedDonations(completedDonations)
                .pendingRequests(pendingRequests)
                .build();
    }

    private void validateStatusTransition(DonationStatus currentStatus, DonationStatus newStatus, boolean isDonor,
            boolean isReceiver) {
        if (currentStatus == newStatus) {
            return;
        }

        switch (currentStatus) {
            case PENDING:
                // De PENDING solo puede pasar a CONFIRMED (por un receptor) o CANCELLED (por el
                // donador)
                if (newStatus == DonationStatus.CONFIRMED && isReceiver) {
                    throw new IllegalArgumentException("Un donador no puede confirmar su propia donación");
                } else if (newStatus == DonationStatus.CANCELLED && !isDonor) {
                    throw new IllegalArgumentException("Solo el donador puede cancelar una donación pendiente");
                } else if (newStatus == DonationStatus.COMPLETED) {
                    throw new IllegalArgumentException("Una donación pendiente no puede marcarse como completada");
                }
                break;

            case CONFIRMED:
                // De CONFIRMED solo puede pasar a COMPLETED (por el receptor) o CANCELLED (por
                // ambos)
                if (newStatus == DonationStatus.COMPLETED && !isReceiver) {
                    throw new IllegalArgumentException("Solo el receptor puede marcar la donación como completada");
                } else if (newStatus == DonationStatus.PENDING) {
                    throw new IllegalArgumentException("No se puede volver a estado pendiente");
                }
                break;

            case COMPLETED:
                // Una donación completada no puede cambiar de estado
                throw new IllegalArgumentException("Una donación completada no puede cambiar de estado");

            case CANCELLED:
                // Una donación cancelada no puede cambiar de estado
                throw new IllegalArgumentException("Una donación cancelada no puede cambiar de estado");
        }
    }

    private DonationResponseDto mapToResponseDto(Donation donation) {
        return DonationResponseDto.builder()
                .id(donation.getId())
                .title(donation.getTitle())
                .description(donation.getDescription())
                .imageUrl(donation.getImageUrl())
                .donorId(donation.getDonor().getId())
                .donorName(donation.getDonor().getFirstName() + " " + donation.getDonor().getLastName())
                .receiverId(donation.getReceiver() != null ? donation.getReceiver().getId() : null)
                .receiverName(donation.getReceiver() != null
                        ? donation.getReceiver().getFirstName() + " " + donation.getReceiver().getLastName()
                        : null)
                .productId(donation.getProduct().getProductId())
                .productName(donation.getProduct().getProductName())
                .donationDate(donation.getDonationDate().format(formatter))
                .receivedDate(donation.getReceivedDate() != null ? donation.getReceivedDate().format(formatter) : null)
                .status(donation.getStatus())
                .donationLocation(donation.getDonationLocation())
                .receiverNote(donation.getReceiverNote())
                .donorNote(donation.getDonorNote())
                .pointsAwarded(donation.getPointsAwarded())
                .build();
    }

    private DonationSummaryDto mapToSummaryDto(Donation donation) {
        return DonationSummaryDto.builder()
                .id(donation.getId())
                .title(donation.getTitle())
                .imageUrl(donation.getImageUrl())
                .donorName(donation.getDonor().getFirstName() + " " + donation.getDonor().getLastName())
                .receiverName(donation.getReceiver() != null
                        ? donation.getReceiver().getFirstName() + " " + donation.getReceiver().getLastName()
                        : null)
                .donationDate(donation.getDonationDate().format(formatter))
                .status(donation.getStatus())
                .pointsAwarded(donation.getPointsAwarded())
                .build();
    }

    private void notifyDonationRequested(Donation donation) {
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                donation.getDonor().getId(),
                "Solicitud de Donación",
                "Tu donación '" + donation.getTitle() + "' ha sido solicitada por " +
                        donation.getReceiver().getFirstName() + " " + donation.getReceiver().getLastName(),
                NotificationType.DONATION,
                donation.getId(),
                "/donations/" + donation.getId(),
                true // Enviar correo
        ));
    }

}