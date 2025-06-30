package com.greenloop.greenloop.notification.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.email.EmailService;
import com.greenloop.greenloop.notification.dto.NotificationCountDto;
import com.greenloop.greenloop.notification.dto.NotificationResponseDto;
import com.greenloop.greenloop.notification.infrastructure.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    @Captor
    private ArgumentCaptor<Notification> notificationCaptor;

    private User testUser;
    private Notification testNotification;
    private NotificationResponseDto testResponseDto;
    private List<Notification> testNotifications;
    private LocalDateTime now = LocalDateTime.now();

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.USER);

        // Setup test notification
        testNotification = Notification.builder()
                .id(1L)
                .title("Test Notification")
                .message("This is a test notification")
                .createdAt(now)
                .isRead(false)
                .type(NotificationType.SYSTEM)
                .user(testUser)
                .build();

        // Setup test response DTO
        testResponseDto = NotificationResponseDto.builder()
                .id(1L)
                .title("Test Notification")
                .message("This is a test notification")
                .createdAt(now.toString())
                .isRead(false)
                .type(NotificationType.SYSTEM)
                .userId(1L)
                .build();

        // Setup test notification list
        testNotifications = new ArrayList<>(Arrays.asList(testNotification));
    }

    @Test
    void createNotification_Success() {
        // Given
        String title = "Test Notification";
        String message = "This is a test notification";
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        NotificationResponseDto result = notificationService.createNotification(1L, title, message);

        // Then
        assertNotNull(result);
        assertEquals(title, result.getTitle());
        assertEquals(message, result.getMessage());
        assertEquals(1L, result.getUserId());

        // Verify notification was saved
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification savedNotification = notificationCaptor.getValue();
        assertEquals(title, savedNotification.getTitle());
        assertEquals(message, savedNotification.getMessage());
        assertEquals(testUser, savedNotification.getUser());
        assertEquals(NotificationType.SYSTEM, savedNotification.getType());
        assertFalse(savedNotification.isRead());

        // Verify WebSocket message was sent
        verify(simpMessagingTemplate).convertAndSend(
                eq("/topic/notifications/1"),
                any(NotificationResponseDto.class)
        );

        // Verify email was sent
        verify(emailService).sendEmail(
                eq("john.doe@example.com"),
                eq("GreenLoop: Test Notification"),
                eq("This is a test notification")
        );
    }

    @Test
    void createNotification_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            notificationService.createNotification(99L, "Test", "Test message");
        });

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository).findById(99L);
        verifyNoInteractions(notificationRepository);
        verifyNoInteractions(simpMessagingTemplate);
        verifyNoInteractions(emailService);
    }

    @Test
    void getUserNotifications_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(testNotifications);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserOrderByCreatedAtDesc(any(User.class), any(Pageable.class)))
                .thenReturn(notificationPage);

        // When
        Page<NotificationResponseDto> result = notificationService.getUserNotifications(1L, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Notification", result.getContent().get(0).getTitle());
        assertEquals("This is a test notification", result.getContent().get(0).getMessage());

        // Verify repos were called correctly
        verify(userRepository).findById(1L);
        verify(notificationRepository).findByUserOrderByCreatedAtDesc(testUser, pageable);
    }

    @Test
    void getUnreadNotifications_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserAndIsReadFalse(any(User.class)))
                .thenReturn(testNotifications);

        // When
        List<NotificationResponseDto> result = notificationService.getUnreadNotifications(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Notification", result.get(0).getTitle());
        assertFalse(result.get(0).isRead());

        // Verify repos were called correctly
        verify(userRepository).findById(1L);
        verify(notificationRepository).findByUserAndIsReadFalse(testUser);
    }

    @Test
    void markAsRead_Success() {
        // Given
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        NotificationResponseDto result = notificationService.markAsRead(1L);

        // Then
        assertNotNull(result);

        // Verify notification was updated
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(notificationCaptor.capture());
        assertTrue(notificationCaptor.getValue().isRead());
    }

    @Test
    void markAsRead_NotificationNotFound_ThrowsException() {
        // Given
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            notificationService.markAsRead(99L);
        });

        assertEquals("Notificación no encontrada", exception.getMessage());
        verify(notificationRepository).findById(99L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAllAsRead_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserAndIsReadFalse(any(User.class)))
                .thenReturn(testNotifications);

        // When
        notificationService.markAllAsRead(1L);

        // Then
        // Verify notification was updated
        verify(userRepository).findById(1L);
        verify(notificationRepository).findByUserAndIsReadFalse(testUser);
        verify(notificationRepository).save(notificationCaptor.capture());
        assertTrue(notificationCaptor.getValue().isRead());
    }

    @Test
    void getNotificationCount_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.countUnreadByUser(any(User.class))).thenReturn(5L);

        // When
        NotificationCountDto result = notificationService.getNotificationCount(1L);

        // Then
        assertNotNull(result);
        assertEquals(5, result.getUnread());

        // Verify repos were called correctly
        verify(userRepository).findById(1L);
        verify(notificationRepository).countUnreadByUser(testUser);
    }

    @Test
    void deleteNotification_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.of(testNotification));

        // When
        notificationService.deleteNotification(1L, 1L);

        // Then
        // Verify notification was deleted
        verify(userRepository).findById(1L);
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void deleteNotification_NotificationNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        Exception exception = assertThrows(EntityNotFoundException.class, () -> {
            notificationService.deleteNotification(99L, 1L);
        });

        assertEquals("Notificación no encontrada", exception.getMessage());
        verify(notificationRepository, never()).delete(any(Notification.class));
    }

    @Test
    void deleteNotification_UnauthorizedUser_ThrowsException() {
        // Given
        User otherUser = new User();
        otherUser.setId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // When & Then
        Exception exception = assertThrows(SecurityException.class, () -> {
            notificationService.deleteNotification(1L, 2L);
        });

        assertEquals("No tienes permiso para eliminar esta notificación", exception.getMessage());
        verify(notificationRepository, never()).delete(any(Notification.class));
    }

    @Test
    void deleteAllNotifications_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        doNothing().when(notificationRepository).deleteAllByUser(any(User.class));

        // When
        notificationService.deleteAllNotifications(1L);

        // Then
        // Verify all notifications were deleted
        verify(userRepository).findById(1L);
        verify(notificationRepository).deleteAllByUser(testUser);
        verify(simpMessagingTemplate).convertAndSend(
                eq("/topic/notifications/1"),
                eq("Todas las notificaciones han sido eliminadas")
        );
    }

    @Test
    void getNotificationsByType_Success() {
        // Given
        NotificationType type = NotificationType.SYSTEM;
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(any(User.class), any(NotificationType.class)))
                .thenReturn(testNotifications);

        // When
        List<NotificationResponseDto> result = notificationService.getNotificationsByType(1L, type);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(NotificationType.SYSTEM, result.get(0).getType());

        // Verify repos were called correctly
        verify(userRepository).findById(1L);
        verify(notificationRepository).findByUserAndTypeOrderByCreatedAtDesc(testUser, type);
    }

    @Test
    void getRecentNotifications_Success() {
        // Given
        int days = 7;
        LocalDateTime cutoffDate = now.minusDays(days);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserAndCreatedAtAfterOrderByCreatedAtDesc(any(User.class), any(LocalDateTime.class)))
                .thenReturn(testNotifications);

        // When
        List<NotificationResponseDto> result = notificationService.getRecentNotifications(1L, days);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());

        // Verify repos were called with correct date range
        verify(userRepository).findById(1L);
        verify(notificationRepository).findByUserAndCreatedAtAfterOrderByCreatedAtDesc(
                eq(testUser),
                any(LocalDateTime.class)
        );
    }

    @Test
    void sendNotification_WebSocketException_DoesNotPropagate() {
        // Given
        doThrow(new RuntimeException("WebSocket error")).when(simpMessagingTemplate)
                .convertAndSend(anyString(), any(Object.class));

        // When
        // This should not throw an exception
        notificationService.sendNotification(testResponseDto);

        // Then
        // Verify the method was called but exception was handled
        verify(simpMessagingTemplate).convertAndSend(
                eq("/topic/notifications/1"),
                eq(testResponseDto)
        );
    }
}
