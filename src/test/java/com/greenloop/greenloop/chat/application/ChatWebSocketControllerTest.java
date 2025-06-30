package com.greenloop.greenloop.chat.application;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.chat.domain.ChatMessage;
import com.greenloop.greenloop.chat.domain.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatWebSocketControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ChatService chatService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatWebSocketController chatWebSocketController;

    private User user1;
    private User user2;
    private Chat chat;
    private ChatMessage chatMessage;

    @BeforeEach
    void setUp() {
        // Setup users
        user1 = new User();
        user1.setId(1L);
        user1.setEmail("user1@example.com");
        user1.setFirstName("User");
        user1.setLastName("One");

        user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
        user2.setFirstName("User");
        user2.setLastName("Two");

        // Setup chat
        chat = new Chat();
        chat.setId(1L);
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setCreatedAt(LocalDateTime.now());
        chat.setMessages(new ArrayList<>());

        // Setup message
        chatMessage = new ChatMessage();
        chatMessage.setId(null); // Will be set by the service
        chatMessage.setSender(user1);
        chatMessage.setContent("Hello, this is a test message");
        chatMessage.setChatId(1L); // For WebSocket handling
    }

    @Test
    void sendMessage_Success() {
        // Given
        when(userRepository.findById(user1.getId())).thenReturn(Optional.of(user1));
        when(chatService.saveMessage(any(ChatMessage.class), eq(1L))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(1L);
            message.setSentAt(LocalDateTime.now());
            return message;
        });
        when(chatService.getChatById(1L)).thenReturn(chat);

        // When
        ChatMessage result = chatWebSocketController.sendMessage(1L, chatMessage);

        // Then
        assertEquals(1L, result.getId());
        assertEquals("Hello, this is a test message", result.getContent());
        assertEquals(user1, result.getSender());

        verify(userRepository).findById(user1.getId());
        verify(chatService).saveMessage(any(ChatMessage.class), eq(1L));
        verify(chatService).getChatById(1L);
        verify(messagingTemplate).convertAndSend(
            eq("/topic/notifications/" + user2.getId()),
            any(ChatWebSocketController.ChatNotification.class)
        );
    }

    @Test
    void sendMessage_UserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findById(user1.getId())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            chatWebSocketController.sendMessage(1L, chatMessage);
        });

        verify(userRepository).findById(user1.getId());
        verify(chatService, never()).saveMessage(any(), any());
        verify(chatService, never()).getChatById(anyLong());
        verify(messagingTemplate, never()).convertAndSend(anyString(), (Object) any());
    }

    @Test
    void sendTypingStatus_ShouldReturnSameStatus() {
        // Given
        ChatWebSocketController.TypingStatus typingStatus = new ChatWebSocketController.TypingStatus();
        typingStatus.setUserId(1L);
        typingStatus.setTyping(true);

        // When
        ChatWebSocketController.TypingStatus result = chatWebSocketController.sendTypingStatus(1L, typingStatus);

        // Then
        assertEquals(1L, result.getUserId());
        assertEquals(true, result.isTyping());
    }

    @Test
    void chatNotification_ShouldHaveCorrectProperties() {
        // Given & When
        ChatWebSocketController.ChatNotification notification =
            new ChatWebSocketController.ChatNotification(1L, 2L, 3L);

        // Then
        assertEquals(1L, notification.getMessageId());
        assertEquals(2L, notification.getSenderId());
        assertEquals(3L, notification.getChatId());
    }
}
