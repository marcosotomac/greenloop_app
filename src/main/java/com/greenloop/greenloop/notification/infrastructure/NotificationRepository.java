package com.greenloop.greenloop.notification.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.notification.domain.Notification;
import com.greenloop.greenloop.notification.domain.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, boolean isRead);

    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false")
    long countUnreadByUser(User user);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user")
    long countByUser(User user);

    List<Notification> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(User user, LocalDateTime date);

    void deleteAllByUser(User user);

    List<Notification> findByUserAndIsReadFalse(User user);
}