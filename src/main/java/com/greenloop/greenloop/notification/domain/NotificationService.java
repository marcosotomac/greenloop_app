package com.greenloop.greenloop.notification.domain;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.email.EmailService;
import com.greenloop.greenloop.notification.dto.NotificationCountDto;
import com.greenloop.greenloop.notification.dto.NotificationResponseDto;
import com.greenloop.greenloop.notification.infrastructure.NotificationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class NotificationService {

        @Autowired
        private NotificationRepository notificationRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private EmailService emailService;

        @Autowired
        private SimpMessagingTemplate simpMessagingTemplate;

        /**
         * Crea una notificación simple para un usuario
         *
         * @param userId  ID del usuario que recibirá la notificación
         * @param title   Título de la notificación
         * @param message Mensaje de la notificación
         * @return
         */
        @Transactional
        public NotificationResponseDto createNotification(Long userId, String title, String message) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                Notification notification = Notification.builder()
                                .title(title)
                                .message(message)
                                .user(user)
                                .isRead(false)
                                .type(NotificationType.SYSTEM)
                                .createdAt(LocalDateTime.now())
                                .build();

                Notification savedNotification = notificationRepository.save(notification);

                // Enviar notificación en tiempo real si está configurado el WebSocket
                NotificationResponseDto responseDto = mapToDto(savedNotification);
                sendNotification(responseDto);

                // Opcionalmente, enviar email
                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "GreenLoop: " + title,
                                        message);
                } catch (Exception e) {
                        // Loguear el error pero permitir que continúe
                        System.err.println("Error al enviar email: " + e.getMessage());
                }
                return responseDto;
        }

        /**
         * Crea una notificación avanzada con tipo, referencia y URL de acción
         *
         * @param userId      ID del usuario que recibirá la notificación
         * @param title       Título de la notificación
         * @param message     Mensaje de la notificación
         * @param type        Tipo de notificación
         * @param referenceId ID de referencia de la entidad relacionada
         * @param actionUrl   URL para la acción asociada
         * @return NotificationResponseDto
         */
        @Transactional
        public NotificationResponseDto createNotification(Long userId, String title, String message,
                        NotificationType type, Long referenceId, String actionUrl) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                Notification notification = Notification.builder()
                                .title(title)
                                .message(message)
                                .user(user)
                                .isRead(false)
                                .type(type)
                                .referenceId(referenceId)
                                .actionUrl(actionUrl)
                                .createdAt(LocalDateTime.now())
                                .build();

                Notification savedNotification = notificationRepository.save(notification);

                // Enviar notificación en tiempo real
                NotificationResponseDto responseDto = mapToDto(savedNotification);
                sendNotification(responseDto);

                return responseDto;
        }

        // Metodo para mapear entidad a DTO (versión simplificada)
        private NotificationResponseDto mapToDto(Notification notification) {
                return NotificationResponseDto.builder()
                                .id(notification.getId())
                                .title(notification.getTitle())
                                .message(notification.getMessage())
                                .createdAt(notification.getCreatedAt().toString())
                                .isRead(notification.isRead())
                                .type(notification.getType())
                                .userId(notification.getUser().getId())
                                .referenceId(notification.getReferenceId())
                                .actionUrl(notification.getActionUrl())
                                .build();
        }

        // Metodo para enviar notificación por WebSocket
        public void sendNotification(NotificationResponseDto notification) {
                try {
                        simpMessagingTemplate.convertAndSend(
                                        "/topic/notifications/" + notification.getUserId(),
                                        notification);
                } catch (Exception e) {
                        // Loguear el error pero permitir que continúe
                        System.err.println("Error al enviar notificación por WebSocket: " + e.getMessage());
                }
        }

        public void deleteAllNotifications(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                notificationRepository.deleteAllByUser(user);

                // Enviar notificación de eliminación
                simpMessagingTemplate.convertAndSend(
                                "/topic/notifications/" + userId,
                                "Todas las notificaciones han sido eliminadas");
        }

        public Page<NotificationResponseDto> getUserNotifications(Long userId, Pageable pageable) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user,
                                pageable);
                return notifications.map(this::mapToDto);
        }

        public List<NotificationResponseDto> getUnreadNotifications(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
                return notifications.stream().map(this::mapToDto).toList();
        }

        public List<NotificationResponseDto> getNotificationsByType(Long userId, NotificationType type) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<Notification> notifications = notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user,
                                type);
                return notifications.stream().map(this::mapToDto).toList();
        }

        public List<NotificationResponseDto> getRecentNotifications(Long userId, int days) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                LocalDateTime date = LocalDateTime.now().minusDays(days);
                List<Notification> notifications = notificationRepository
                                .findByUserAndCreatedAtAfterOrderByCreatedAtDesc(user,
                                                date);
                return notifications.stream().map(this::mapToDto).toList();
        }

        public void deleteNotification(Long id, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                Notification notification = notificationRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Notificación no encontrada"));

                if (!notification.getUser().equals(user)) {
                        throw new SecurityException("No tienes permiso para eliminar esta notificación");
                }

                notificationRepository.delete(notification);
        }

        public NotificationCountDto getNotificationCount(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                long totalCount = notificationRepository.countByUser(user);
                long unreadCount = notificationRepository.countUnreadByUser(user);

                return NotificationCountDto.builder()
                                .total(totalCount)
                                .unread(unreadCount)
                                .build();
        }

        public void markAllAsRead(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
                for (Notification notification : notifications) {
                        notification.setRead(true);
                        notificationRepository.save(notification);
                }
        }

        public NotificationResponseDto markAsRead(Long id) {
                Notification notification = notificationRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Notificación no encontrada"));

                notification.setRead(true);
                Notification updatedNotification = notificationRepository.save(notification);
                return mapToDto(updatedNotification);
        }

        // ======= MÉTODOS ESPECÍFICOS PARA EVENTOS DE GREENLOOP =======

        /**
         * Notifica cuando un usuario crea un nuevo producto
         */
        @Transactional
        public void notifyProductCreated(Long creatorId, Long productId, String productName) {
                // Obtener seguidores del creador (asumiendo que existe una relación de
                // seguimiento)
                // Por ahora, crearemos la notificación para el mismo usuario
                createNotification(
                                creatorId,
                                "✅ Producto Publicado",
                                "Tu producto '" + productName + "' ha sido publicado exitosamente en GreenLoop.",
                                NotificationType.PRODUCT_CREATED,
                                productId,
                                "/productos/" + productId);
        }

        /**
         * Notifica cuando alguien le da like a un producto
         */
        @Transactional
        public void notifyProductLiked(Long productOwnerId, Long likerId, Long productId, String productName,
                        String likerName) {
                createNotification(
                                productOwnerId,
                                "❤️ ¡Tu producto gustó!",
                                likerName + " le dio me gusta a tu producto '" + productName + "'.",
                                NotificationType.PRODUCT_LIKED,
                                productId,
                                "/productos/" + productId);
        }

        /**
         * Notifica cuando alguien comenta en un producto
         */
        @Transactional
        public void notifyProductCommented(Long productOwnerId, Long commenterId, Long productId, String productName,
                        String commenterName) {
                createNotification(
                                productOwnerId,
                                "💬 Nuevo comentario",
                                commenterName + " comentó en tu producto '" + productName + "'.",
                                NotificationType.PRODUCT_COMMENTED,
                                productId,
                                "/productos/" + productId);
        }

        /**
         * Notifica cuando se crea una nueva comunidad
         */
        @Transactional
        public void notifyCommunityCreated(Long creatorId, Long communityId, String communityName) {
                createNotification(
                                creatorId,
                                "🌱 Comunidad Creada",
                                "Tu comunidad '" + communityName + "' ha sido creada exitosamente.",
                                NotificationType.COMMUNITY_CREATED,
                                communityId,
                                "/comunidades/" + communityId);
        }

        /**
         * Notifica cuando alguien se une a una comunidad
         */
        @Transactional
        public void notifyCommunityJoined(Long communityOwnerId, Long newMemberId, Long communityId,
                        String communityName, String memberName) {
                createNotification(
                                communityOwnerId,
                                "👥 Nuevo miembro",
                                memberName + " se unió a tu comunidad '" + communityName + "'.",
                                NotificationType.COMMUNITY_JOINED,
                                communityId,
                                "/comunidades/" + communityId);
        }

        /**
         * Notifica nueva solicitud de intercambio
         */
        @Transactional
        public void notifyExchangeRequest(Long receiverId, Long requesterId, Long exchangeId, String requesterName,
                        String productName) {
                createNotification(
                                receiverId,
                                "🔄 Nueva solicitud de intercambio",
                                requesterName + " quiere intercambiar por tu producto '" + productName + "'.",
                                NotificationType.EXCHANGE_REQUEST,
                                exchangeId,
                                "/intercambios/" + exchangeId);
        }

        /**
         * Notifica cuando se acepta un intercambio
         */
        @Transactional
        public void notifyExchangeAccepted(Long requesterId, Long accepterId, Long exchangeId, String accepterName,
                        String productName) {
                createNotification(
                                requesterId,
                                "✅ Intercambio aceptado",
                                accepterName + " aceptó tu solicitud de intercambio por '" + productName + "'.",
                                NotificationType.EXCHANGE_ACCEPTED,
                                exchangeId,
                                "/intercambios/" + exchangeId);
        }

        /**
         * Notifica cuando se rechaza un intercambio
         */
        @Transactional
        public void notifyExchangeRejected(Long requesterId, Long rejecterId, Long exchangeId, String rejecterName,
                        String productName) {
                createNotification(
                                requesterId,
                                "❌ Intercambio rechazado",
                                rejecterName + " rechazó tu solicitud de intercambio por '" + productName + "'.",
                                NotificationType.EXCHANGE_REJECTED,
                                exchangeId,
                                "/intercambios/" + exchangeId);
        }

        /**
         * Notifica cuando un artículo de la wishlist está disponible
         */
        @Transactional
        public void notifyWishlistItemAvailable(Long userId, Long productId, String productName, String ownerName) {
                createNotification(
                                userId,
                                "⭐ Artículo disponible",
                                "¡Buenas noticias! '" + productName + "' de " + ownerName
                                                + " está disponible en tu lista de deseos.",
                                NotificationType.WISHLIST_ITEM_AVAILABLE,
                                productId,
                                "/productos/" + productId);
        }

        /**
         * Notifica nuevo seguidor
         */
        @Transactional
        public void notifyNewFollower(Long followedUserId, Long followerId, String followerName) {
                createNotification(
                                followedUserId,
                                "👤 Nuevo seguidor",
                                followerName + " comenzó a seguirte en GreenLoop.",
                                NotificationType.FOLLOW,
                                followerId,
                                "/perfil/" + followerId);
        }

        /**
         * Notifica nueva valoración recibida
         */
        @Transactional
        public void notifyNewRating(Long ratedUserId, Long raterId, String raterName, int stars) {
                String starsText = "⭐".repeat(stars);
                createNotification(
                                ratedUserId,
                                "⭐ Nueva valoración",
                                raterName + " te valoró con " + starsText + " (" + stars + "/5 estrellas).",
                                NotificationType.RATING,
                                raterId,
                                "/perfil/" + ratedUserId);
        }

        /**
         * Notifica logro desbloqueado
         */
        @Transactional
        public void notifyAchievementUnlocked(Long userId, String achievementName, String description) {
                createNotification(
                                userId,
                                "🏆 ¡Logro desbloqueado!",
                                "Has desbloqueado el logro: " + achievementName + ". " + description,
                                NotificationType.ACHIEVEMENT,
                                null,
                                "/logros");
        }

}
