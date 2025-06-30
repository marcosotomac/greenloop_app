package com.greenloop.greenloop.User.infrastructure;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.greenloop.greenloop.User.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
    // Optional<User> findByUsername(String username);

    // Nuevos métodos para el dashboard
    @Query("SELECT COUNT(u) FROM User u WHERE u.joinedAt BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);

    @Query("SELECT COUNT(DISTINCT u) FROM User u WHERE " +
            "(EXISTS (SELECT d FROM Donation d WHERE d.donor = u AND d.donationDate >= :since) OR " +
            "EXISTS (SELECT e FROM Exchange e WHERE (e.requester = u OR e.provider = u) AND e.requestedAt >= :since))")
    Long countActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u ORDER BY u.joinedAt DESC")
    List<User> findRecentUsers(Pageable pageable);
}
