package com.greenloop.greenloop.donation.domain;

public enum DonationStatus {
    PENDING,      // Donación ofrecida pero no confirmada
    CONFIRMED,    // Donación confirmada pero no recibida
    COMPLETED,    // Donación completada (recibida)
    CANCELLED     // Donación cancelada
}