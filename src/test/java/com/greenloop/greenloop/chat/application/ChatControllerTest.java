package com.greenloop.greenloop.chat.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.chat.domain.ChatMessage;
import com.greenloop.greenloop.chat.domain.ChatService;
import com.greenloop.greenloop.config.SecurityConfig;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.product.domain.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ChatController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
    classes = {SecurityConfig.class}))
@AutoConfigureMockMvc(addFilters = false)
public class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ChatService chatService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    private User user1;
    private User user2;
    private Product product;
    private Chat chat;
    private ChatMessage chatMessage;
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
        chatMessage = new ChatMessage();
        chatMessage.setId(1L);
        chatMessage.setSender(user1);
        chatMessage.setContent("Hello, this is a test message");
        chatMessage.setSentAt(LocalDateTime.now());
        chatMessage.setStatus(ChatMessage.MessageStatus.SENT);
        chatMessage.setChat(chat);

        // Setup lists
        chats = Arrays.asList(chat);
        messages = Arrays.asList(chatMessage);
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void startChat_Success() throws Exception {
        // Given
        when(userRepository.findByEmail("user1@example.com")).thenReturn(user1);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(chatService.startChat(user1, user2, 1L)).thenReturn(chat);

        // When & Then
        mockMvc.perform(post("/api/chats/start")
                .with(csrf())
                .param("otherUserId", "2")
                .param("productId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        verify(userRepository).findByEmail("user1@example.com");
        verify(userRepository).findById(2L);
        verify(chatService).startChat(user1, user2, 1L);
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void startChat_CurrentUserNotFound_ShouldReturnBadRequest() throws Exception {
        // Given
        when(userRepository.findByEmail("user1@example.com")).thenReturn(null);

        // When & Then
        mockMvc.perform(post("/api/chats/start")
                .with(csrf())
                .param("otherUserId", "2")
                .param("productId", "1"))
                .andExpect(status().isBadRequest());

        verify(userRepository).findByEmail("user1@example.com");
        verify(chatService, never()).startChat(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void getMyChats_Success() throws Exception {
        // Given
        when(userRepository.findByEmail("user1@example.com")).thenReturn(user1);
        when(chatService.getUserChats(user1)).thenReturn(chats);

        // When & Then
        mockMvc.perform(get("/api/chats/my-chats")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)));

        verify(userRepository).findByEmail("user1@example.com");
        verify(chatService).getUserChats(user1);
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void getMyChats_CurrentUserNotFound_ShouldReturnBadRequest() throws Exception {
        // Given
        when(userRepository.findByEmail("user1@example.com")).thenReturn(null);

        // When & Then
        mockMvc.perform(get("/api/chats/my-chats")
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(userRepository).findByEmail("user1@example.com");
        verify(chatService, never()).getUserChats(any());
    }

    @Test
    @WithMockUser
    void getChatMessages_Success() throws Exception {
        // Given
        when(chatService.getChatMessages(1L)).thenReturn(messages);

        // When & Then
        mockMvc.perform(get("/api/chats/1/messages")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content", is("Hello, this is a test message")));

        verify(chatService).getChatMessages(1L);
    }

    @Test
    @WithMockUser
    void getChatsByProduct_Success() throws Exception {
        // Given
        when(chatService.getChatsByProduct(1L)).thenReturn(chats);

        // When & Then
        mockMvc.perform(get("/api/chats/product/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)));

        verify(chatService).getChatsByProduct(1L);
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void sendMessage_Success() throws Exception {
        // Given
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent("New test message");

        when(userRepository.findByEmail("user1@example.com")).thenReturn(user1);
        when(chatService.saveMessage(any(ChatMessage.class), eq(1L))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(2L);
            message.setSender(user1);
            message.setSentAt(LocalDateTime.now());
            return message;
        });

        // When & Then
        mockMvc.perform(post("/api/chats/1/messages")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newMessage)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.content", is("New test message")));

        verify(userRepository).findByEmail("user1@example.com");
        verify(chatService).saveMessage(any(ChatMessage.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void sendMessage_CurrentUserNotFound_ShouldReturnBadRequest() throws Exception {
        // Given
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent("New test message");

        when(userRepository.findByEmail("user1@example.com")).thenReturn(null);

        // When & Then
        mockMvc.perform(post("/api/chats/1/messages")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newMessage)))
                .andExpect(status().isBadRequest());

        verify(userRepository).findByEmail("user1@example.com");
        verify(chatService, never()).saveMessage(any(), any());
    }
}
