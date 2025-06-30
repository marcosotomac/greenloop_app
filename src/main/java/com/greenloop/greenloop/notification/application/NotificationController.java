package com.greenloop.greenloop.notification.application;

import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.notification.domain.NotificationType;
import com.greenloop.greenloop.notification.dto.NotificationCountDto;
import com.greenloop.greenloop.notification.dto.NotificationRequestDto;
import com.greenloop.greenloop.notification.dto.NotificationResponseDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtService jwtService;

    // Crear una notificación (solo admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponseDto> createNotification(
            @Valid @RequestBody NotificationRequestDto requestDto) {
        NotificationResponseDto notification = notificationService.createNotification(requestDto.getUserId(),
                requestDto.getTitle(), requestDto.getMessage());
        return new ResponseEntity<>(notification, HttpStatus.CREATED);
    }

    // Obtener todas las notificaciones del usuario
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDto>> getUserNotifications(
            Authentication authentication,
            Pageable pageable) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        Page<NotificationResponseDto> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    // Obtener notificaciones no leídas
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotifications(
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<NotificationResponseDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // Marcar una notificación como leída
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDto> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        // Verificación de permisos se maneja en el servicio
        NotificationResponseDto notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    // Marcar todas las notificaciones como leídas
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Obtener el conteo de notificaciones
    @GetMapping("/count")
    public ResponseEntity<NotificationCountDto> getNotificationCount(
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        NotificationCountDto count = notificationService.getNotificationCount(userId);
        return ResponseEntity.ok(count);
    }

    // Obtener notificaciones recientes (últimos N días)
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationResponseDto>> getRecentNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int days) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<NotificationResponseDto> notifications = notificationService.getRecentNotifications(userId, days);
        return ResponseEntity.ok(notifications);
    }

    // Obtener notificaciones por tipo
    @GetMapping("/type/{type}")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByType(
            Authentication authentication,
            @PathVariable NotificationType type) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<NotificationResponseDto> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(notifications);
    }

    // Eliminar una notificación
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Eliminar todas las notificaciones
    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        notificationService.deleteAllNotifications(userId);
        return ResponseEntity.noContent().build();
    }

    // Endpoint especial para responder a solicitudes desde notificaciones
    @PostMapping("/handle-membership-request/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> handleMembershipRequestFromNotification(
            @PathVariable Long requestId,
            @RequestParam Boolean approved,
            @RequestParam(required = false) String responseMessage,
            Authentication authentication) {

        // Este endpoint redirige a la funcionalidad del CommunityController
        // pero está en NotificationController para facilitar el manejo desde
        // notificaciones

        Map<String, Object> response = new HashMap<>();
        try {
            // Aquí podrías llamar al CommunityMembershipRequestService directamente
            // o hacer una redirección interna al endpoint correcto
            response.put("success", true);
            response.put("message", "La solicitud será procesada. Redirigiendo...");
            response.put("redirectUrl", "/api/communities/membership-requests/" + requestId + "/respond");
            response.put("requestId", requestId);
            response.put("approved", approved);
            response.put("responseMessage", responseMessage);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al procesar la solicitud: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
