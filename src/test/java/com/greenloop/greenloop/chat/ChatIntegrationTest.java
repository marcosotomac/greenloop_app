package com.greenloop.greenloop.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.chat.domain.ChatMessage;
import com.greenloop.greenloop.chat.domain.ChatMessage.MessageStatus;
import com.greenloop.greenloop.chat.infrastructure.ChatMessageRepository;
import com.greenloop.greenloop.chat.infrastructure.ChatRepository;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.product.domain.Condition;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class ChatIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MockitoBean
    private JwtService jwtService;

    private User user1;
    private User user2;
    private Product product;

    @BeforeEach
    void setUp() {
        // Clear any existing data
        chatMessageRepository.deleteAll();
        chatRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();

        // Create test users
        user1 = new User();
        user1.setEmail("user1@example.com");
        user1.setFirstName("User");
        user1.setLastName("One");
        user1.setPassword("password1");
        user1 = userRepository.save(user1);

        user2 = new User();
        user2.setEmail("user2@example.com");
        user2.setFirstName("User");
        user2.setLastName("Two");
        user2.setPassword("password2");
        user2 = userRepository.save(user2);

        // Create test product
        product = new Product();
        product.setProductName("Test Product");
        product.setDescription("Test Description");
        product.setUser(user1);
        product.setCategory(Category.ELECTRONICS); // Adding the required category field
        product.setCondition(Condition.NEW);       // Added for condition constraint
        product.setImageUrl("http://example.com/test-image.jpg"); // Required field
        product = productRepository.save(product);
    }

    @AfterEach
    void tearDown() {
        // Clean up test data
        chatMessageRepository.deleteAll();
        chatRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void startChat_ThenSendMessage_ShouldCreateChatAndMessage() throws Exception {
        // Start a chat
        String result = mockMvc.perform(post("/api/chats/start")
                .with(csrf())
                .param("otherUserId", user2.getId().toString())
                .param("productId", product.getProductId().toString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Chat chat = objectMapper.readValue(result, Chat.class);

        assertThat(chat).isNotNull();
        assertThat(chat.getId()).isNotNull();
        assertThat(chat.getUser1().getId()).isEqualTo(user1.getId());
        assertThat(chat.getUser2().getId()).isEqualTo(user2.getId());
        assertThat(chat.getProduct().getProductId()).isEqualTo(product.getProductId());

        // Send a message in the chat
        ChatMessage message = new ChatMessage();
        message.setContent("Hello, this is an integration test message!");

        mockMvc.perform(post("/api/chats/" + chat.getId() + "/messages")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(message)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Hello, this is an integration test message!"))
                .andExpect(jsonPath("$.sender.id").value(user1.getId()));

        // Verify message was saved to database
        List<ChatMessage> messages = chatMessageRepository.findByChatIdOrderBySentAtAsc(chat.getId());
        assertThat(messages).hasSize(1);
        assertThat(messages.get(0).getContent()).isEqualTo("Hello, this is an integration test message!");
        assertThat(messages.get(0).getSender().getId()).isEqualTo(user1.getId());
        assertThat(messages.get(0).getChat().getId()).isEqualTo(chat.getId());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void getUserChats_ShouldReturnUserChats() throws Exception {
        // Create a chat first
        Chat chat = new Chat();
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setProduct(product);
        chat = chatRepository.save(chat);

        // Test getting user's chats
        mockMvc.perform(get("/api/chats/my-chats")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(chat.getId()))
                .andExpect(jsonPath("$[0].user1.id").value(user1.getId()))
                .andExpect(jsonPath("$[0].user2.id").value(user2.getId()));
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void getChatMessages_ShouldReturnMessages() throws Exception {
        // Create a chat
        Chat chat = new Chat();
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setProduct(product);
        chat = chatRepository.save(chat);

        // Add some messages
        ChatMessage message1 = new ChatMessage();
        message1.setSender(user1);
        message1.setContent("First test message");
        message1.setChat(chat);
        message1.setStatus(MessageStatus.SENT);
        chatMessageRepository.save(message1);

        ChatMessage message2 = new ChatMessage();
        message2.setSender(user2);
        message2.setContent("Second test message");
        message2.setChat(chat);
        message2.setStatus(MessageStatus.SENT);
        chatMessageRepository.save(message2);

        // Test getting chat messages
        mockMvc.perform(get("/api/chats/" + chat.getId() + "/messages")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].content").value("First test message"))
                .andExpect(jsonPath("$[0].sender.id").value(user1.getId()))
                .andExpect(jsonPath("$[1].content").value("Second test message"))
                .andExpect(jsonPath("$[1].sender.id").value(user2.getId()));
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    void getChatsByProduct_ShouldReturnChats() throws Exception {
        // Create a chat for the product
        Chat chat = new Chat();
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setProduct(product);
        chat = chatRepository.save(chat);

        // Test getting chats by product
        mockMvc.perform(get("/api/chats/product/" + product.getProductId())
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(chat.getId()))
                .andExpect(jsonPath("$[0].user1.id").value(user1.getId()))
                .andExpect(jsonPath("$[0].user2.id").value(user2.getId()))
                .andExpect(jsonPath("$[0].product.productId").value(product.getProductId())); // Using 'productId' instead of 'id'
    }
}
