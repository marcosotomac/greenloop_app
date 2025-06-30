package com.greenloop.greenloop.notification.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.notification.domain.NotificationType;
import com.greenloop.greenloop.notification.dto.NotificationCountDto;
import com.greenloop.greenloop.notification.dto.NotificationRequestDto;
import com.greenloop.greenloop.notification.dto.NotificationResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private JwtService jwtService;

    private NotificationRequestDto requestDto;
    private NotificationResponseDto responseDto;
    private List<NotificationResponseDto> notifications;
    private Page<NotificationResponseDto> notificationPage;
    private NotificationCountDto countDto;

    @BeforeEach
    void setUp() {
        // Set up request DTO
        requestDto = NotificationRequestDto.builder()
                .userId(1L)
                .title("Test Notification")
                .message("This is a test notification")
                .type(NotificationType.SYSTEM)
                .sendEmail(true)
                .build();

        // Set up response DTO
        responseDto = NotificationResponseDto.builder()
                .id(1L)
                .title("Test Notification")
                .message("This is a test notification")
                .createdAt(LocalDateTime.now().toString())
                .isRead(false)
                .type(NotificationType.SYSTEM)
                .userId(1L)
                .build();

        // Set up notification list
        notifications = Arrays.asList(responseDto);

        // Set up notification page
        notificationPage = new PageImpl<>(notifications);

        // Set up count DTO
        countDto = new NotificationCountDto(5L, 3L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createNotification_Success() throws Exception {
        // Given
        when(notificationService.createNotification(anyLong(), anyString(), anyString()))
                .thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/notifications")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Notification")))
                .andExpect(jsonPath("$.message", is("This is a test notification")))
                .andExpect(jsonPath("$.read", is(false)));

        verify(notificationService).createNotification(
                eq(1L),
                eq("Test Notification"),
                eq("This is a test notification")
        );
    }

    @Test
    @WithMockUser(username = "user")
    void getUserNotifications_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(notificationPage);

        // When & Then
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].title", is("Test Notification")))
                .andExpect(jsonPath("$.content[0].read", is(false)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).getUserNotifications(eq(1L), any(Pageable.class));
    }

    @Test
    @WithMockUser(username = "user")
    void getUnreadNotifications_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(notificationService.getUnreadNotifications(anyLong())).thenReturn(notifications);

        // When & Then
        mockMvc.perform(get("/api/notifications/unread"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Test Notification")))
                .andExpect(jsonPath("$[0].read", is(false)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).getUnreadNotifications(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void markAsRead_Success() throws Exception {
        // Given
        when(notificationService.markAsRead(anyLong())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(put("/api/notifications/1/read")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Notification")));

        verify(notificationService).markAsRead(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void markAllAsRead_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        doNothing().when(notificationService).markAllAsRead(anyLong());

        // When & Then
        mockMvc.perform(put("/api/notifications/read-all")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).markAllAsRead(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void getNotificationCount_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(notificationService.getNotificationCount(anyLong())).thenReturn(countDto);

        // When & Then
        mockMvc.perform(get("/api/notifications/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", is(5)))
                .andExpect(jsonPath("$.unread", is(3)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).getNotificationCount(1L);
    }

    @Test
    @WithMockUser(username = "user")
    void getRecentNotifications_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(notificationService.getRecentNotifications(anyLong(), anyInt())).thenReturn(notifications);

        // When & Then
        mockMvc.perform(get("/api/notifications/recent")
                .param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Test Notification")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).getRecentNotifications(1L, 7);
    }

    @Test
    @WithMockUser(username = "user")
    void getNotificationsByType_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(notificationService.getNotificationsByType(anyLong(), any(NotificationType.class)))
                .thenReturn(notifications);

        // When & Then
        mockMvc.perform(get("/api/notifications/type/SYSTEM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].type", is("SYSTEM")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).getNotificationsByType(1L, NotificationType.SYSTEM);
    }

    @Test
    @WithMockUser(username = "user")
    void deleteNotification_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        doNothing().when(notificationService).deleteNotification(anyLong(), anyLong());

        // When & Then
        mockMvc.perform(delete("/api/notifications/1")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).deleteNotification(1L, 1L);
    }

    @Test
    @WithMockUser(username = "user")
    void deleteAllNotifications_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        doNothing().when(notificationService).deleteAllNotifications(anyLong());

        // When & Then
        mockMvc.perform(delete("/api/notifications")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(notificationService).deleteAllNotifications(1L);
    }
}
