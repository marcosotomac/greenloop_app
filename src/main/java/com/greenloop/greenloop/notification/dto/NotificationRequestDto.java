package com.greenloop.greenloop.notification.dto;

import com.greenloop.greenloop.notification.domain.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
    @NotNull(message = "El ID del usuario es obligatorio")
    private Long userId;

    @NotBlank(message = "El título de la notificación es obligatorio")
    private String title;

    @NotBlank(message = "El mensaje de la notificación es obligatorio")
    private String message;

    private NotificationType type = NotificationType.SYSTEM;

    private Long referenceId;

    private String actionUrl;

    private boolean sendEmail = false;
}