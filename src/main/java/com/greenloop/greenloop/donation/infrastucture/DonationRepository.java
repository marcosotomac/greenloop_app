package com.greenloop.greenloop.donation.infrastucture;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.donation.domain.Donation;
import com.greenloop.greenloop.donation.domain.DonationStatus;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByDonor(User donor);

    List<Donation> findByReceiver(User receiver);

    List<Donation> findByStatus(DonationStatus status);

    @Query("SELECT d FROM Donation d WHERE d.donor = :user OR d.receiver = :user")
    List<Donation> findByDonorOrReceiver(User user);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.donor = :donor AND d.status = 'COMPLETED'")
    Long countCompletedDonationsByDonor(User donor);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.donor = :user")
    Long countDonationsByDonor(User user);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.receiver = :user AND d.status = 'COMPLETED'")
    Long countReceivedDonationsByUser(User user);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.status = 'PENDING'")
    Long countActiveDonations();

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.receiver = :user AND d.status = 'CONFIRMED'")
    Long countPendingRequestsByUser(User user);

    @Query("SELECT COALESCE(SUM(d.pointsAwarded), 0) FROM Donation d WHERE d.receiver = :user AND d.status = 'COMPLETED'")
    Integer sumPointsEarnedByUser(User user);

    // Nuevos métodos para el dashboard
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.donationDate BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT d FROM Donation d ORDER BY d.donationDate DESC")
    List<Donation> findRecentDonations(Pageable pageable);
}