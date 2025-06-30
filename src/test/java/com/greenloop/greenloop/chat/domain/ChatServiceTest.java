package com.greenloop.greenloop.chat.domain;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.chat.infrastructure.ChatMessageRepository;
import com.greenloop.greenloop.chat.infrastructure.ChatRepository;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ChatService chatService;

    private User user1;
    private User user2;
    private Product product;
    private Chat chat;
    private ChatMessage message;
    private List<Chat> chats;
    private List<ChatMessage> messages;

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

        // Setup product
        product = new Product();
        product.setProductId(1L);
        product.setProductName("Test Product");
        product.setDescription("Test Description");

        // Setup chat
        chat = new Chat();
        chat.setId(1L);
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setProduct(product);
        chat.setCreatedAt(LocalDateTime.now());
        chat.setMessages(new ArrayList<>());

        // Setup message
        message = new ChatMessage();
        message.setId(1L);
        message.setSender(user1);
        message.setContent("Hello, this is a test message");
        message.setSentAt(LocalDateTime.now());
        message.setStatus(ChatMessage.MessageStatus.SENT);
        message.setChat(chat);

        // Setup lists
        chats = Arrays.asList(chat);
        messages = Arrays.asList(message);
    }

    @Test
    void startChat_WithExistingChat_ShouldReturnExistingChat() {
        // Given
        when(productRepository.findById(product.getProductId())).thenReturn(Optional.of(product));
        when(chatRepository.findByUser1AndUser2AndProduct(user1, user2, product)).thenReturn(Optional.of(chat));

        // When
        Chat result = chatService.startChat(user1, user2, product.getProductId());

        // Then
        assertEquals(chat, result);
        verify(chatRepository).findByUser1AndUser2AndProduct(user1, user2, product);
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    void startChat_WithNewChat_ShouldCreateAndReturnNewChat() {
        // Given
        when(productRepository.findById(product.getProductId())).thenReturn(Optional.of(product));
        when(chatRepository.findByUser1AndUser2AndProduct(user1, user2, product)).thenReturn(Optional.empty());
        when(chatRepository.save(any(Chat.class))).thenAnswer(invocation -> {
            Chat savedChat = invocation.getArgument(0);
            savedChat.setId(1L);
            return savedChat;
        });

        // When
        Chat result = chatService.startChat(user1, user2, product.getProductId());

        // Then
        assertEquals(1L, result.getId());
        assertEquals(user1, result.getUser1());
        assertEquals(user2, result.getUser2());
        assertEquals(product, result.getProduct());
        verify(chatRepository).findByUser1AndUser2AndProduct(user1, user2, product);
        verify(chatRepository).save(any(Chat.class));
    }

    @Test
    void startChat_WithInvalidProduct_ShouldThrowException() {
        // Given
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            chatService.startChat(user1, user2, 99L);
        });
        assertEquals("Producto no encontrado", exception.getMessage());
    }

    @Test
    void getUserChats_ShouldReturnUserChats() {
        // Given
        when(chatRepository.findByUser1OrUser2(user1, user1)).thenReturn(chats);

        // When
        List<Chat> result = chatService.getUserChats(user1);

        // Then
        assertEquals(chats, result);
        verify(chatRepository).findByUser1OrUser2(user1, user1);
    }

    @Test
    void getChatMessages_ShouldReturnChatMessages() {
        // Given
        when(messageRepository.findByChatIdOrderBySentAtAsc(1L)).thenReturn(messages);

        // When
        List<ChatMessage> result = chatService.getChatMessages(1L);

        // Then
        assertEquals(messages, result);
        verify(messageRepository).findByChatIdOrderBySentAtAsc(1L);
    }

    @Test
    void saveMessage_ShouldSaveAndReturnMessage() {
        // Given
        ChatMessage newMessage = new ChatMessage();
        newMessage.setSender(user1);
        newMessage.setContent("New test message");

        when(chatRepository.findById(1L)).thenReturn(Optional.of(chat));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage savedMessage = invocation.getArgument(0);
            savedMessage.setId(2L);
            return savedMessage;
        });

        // When
        ChatMessage result = chatService.saveMessage(newMessage, 1L);

        // Then
        assertEquals(2L, result.getId());
        assertEquals("New test message", result.getContent());
        assertEquals(chat, result.getChat());
        verify(chatRepository).findById(1L);
        verify(messageRepository).save(newMessage);
    }

    @Test
    void saveMessage_WithInvalidChat_ShouldThrowException() {
        // Given
        ChatMessage newMessage = new ChatMessage();
        when(chatRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            chatService.saveMessage(newMessage, 99L);
        });
        assertEquals("Chat no encontrado", exception.getMessage());
    }

    @Test
    void getChatById_WithValidId_ShouldReturnChat() {
        // Given
        when(chatRepository.findById(1L)).thenReturn(Optional.of(chat));

        // When
        Chat result = chatService.getChatById(1L);

        // Then
        assertEquals(chat, result);
        verify(chatRepository).findById(1L);
    }

    @Test
    void getChatById_WithInvalidId_ShouldThrowException() {
        // Given
        when(chatRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            chatService.getChatById(99L);
        });
        assertEquals("Chat no encontrado", exception.getMessage());
    }

    @Test
    void getChatsByProduct_ShouldReturnChats() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(chatRepository.findByProduct(product)).thenReturn(chats);

        // When
        List<Chat> result = chatService.getChatsByProduct(1L);

        // Then
        assertEquals(chats, result);
        verify(productRepository).findById(1L);
        verify(chatRepository).findByProduct(product);
    }

    @Test
    void getChatsByProduct_WithInvalidProduct_ShouldThrowException() {
        // Given
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            chatService.getChatsByProduct(99L);
        });
        assertEquals("Producto no encontrado", exception.getMessage());
    }
}
