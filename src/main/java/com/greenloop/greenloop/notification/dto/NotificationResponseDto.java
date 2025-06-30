package com.greenloop.greenloop.notification.dto;

import com.greenloop.greenloop.notification.domain.NotificationType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String message;
    private String createdAt;
    private boolean isRead;
    private NotificationType type;
    private Long userId;
    private Long referenceId;
    private String actionUrl;
}