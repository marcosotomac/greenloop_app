package com.greenloop.greenloop.chat.application;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.chat.domain.ChatMessage;
import com.greenloop.greenloop.chat.domain.ChatService;
import com.greenloop.greenloop.chat.dto.ChatResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @PostMapping("/start")
    public ResponseEntity<Chat> startChat(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam Long otherUserId,
            @RequestParam Long productId) {

        System.out.println("=== DEBUG: Starting chat ===");
        System.out.println("Current user: " + currentUser.getUsername());
        System.out.println("Other user ID: " + otherUserId);
        System.out.println("Product ID: " + productId);

        User user1 = userRepository.findByEmail(currentUser.getUsername());
        if (user1 == null) {
            System.out.println("ERROR: Current user not found");
            return ResponseEntity.badRequest().body(null);
        }

        System.out.println("Current user found: " + user1.getId() + " - " + user1.getFirstName());

        User user2 = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Usuario destinatario no encontrado"));

        System.out.println("Other user found: " + user2.getId() + " - " + user2.getFirstName());

        Chat chat = chatService.startChat(user1, user2, productId);

        System.out.println("Chat created/found: " + chat.getId());
        System.out.println("=== END DEBUG ===");

        return ResponseEntity.ok(chat);
    }

    // Endpoint temporal para testing sin autenticación
    @PostMapping("/debug/start")
    public ResponseEntity<ChatResponseDto> startChatDebug(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id,
            @RequestParam Long productId) {

        System.out.println("=== DEBUG CHAT (NO AUTH) ===");
        System.out.println("User1 ID: " + user1Id);
        System.out.println("User2 ID: " + user2Id);
        System.out.println("Product ID: " + productId);

        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Usuario 1 no encontrado"));

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Usuario 2 no encontrado"));

        System.out.println("User1 found: " + user1.getId() + " - " + user1.getFirstName());
        System.out.println("User2 found: " + user2.getId() + " - " + user2.getFirstName());

        Chat chat = chatService.startChat(user1, user2, productId);

        System.out.println("Chat created/found with ID: " + chat.getId());
        System.out.println("=== END DEBUG CHAT ===");

        return ResponseEntity.ok(convertToChatResponse(chat));
    }

    @GetMapping("/my-chats")
    public ResponseEntity<List<Chat>> getMyChats(@AuthenticationPrincipal UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().body(null);
        }

        List<Chat> chats = chatService.getUserChats(user);
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatMessages(@PathVariable Long chatId) {
        List<ChatMessage> messages = chatService.getChatMessages(chatId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Chat>> getChatsByProduct(@PathVariable Long productId) {
        List<Chat> chats = chatService.getChatsByProduct(productId);
        return ResponseEntity.ok(chats);
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable Long chatId,
            @RequestBody ChatMessage message,
            @AuthenticationPrincipal UserDetails currentUser) {

        User sender = userRepository.findByEmail(currentUser.getUsername());

        if (sender == null) {
            return ResponseEntity.badRequest().body(null);
        }

        message.setSender(sender);
        ChatMessage savedMessage = chatService.saveMessage(message, chatId);
        return ResponseEntity.ok(savedMessage);
    }

    @PostMapping("/debug/{chatId}/messages")
    public ResponseEntity<ChatMessage> sendMessageDebug(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> request) {

        System.out.println("=== DEBUG SEND MESSAGE (NO AUTH) ===");
        System.out.println("Chat ID: " + chatId);
        System.out.println("Content: " + request.get("content"));
        System.out.println("Sender ID: " + request.get("senderId"));

        User sender = userRepository.findById(Long.parseLong(request.get("senderId")))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ChatMessage message = new ChatMessage();
        message.setContent(request.get("content"));
        message.setSender(sender);

        ChatMessage savedMessage = chatService.saveMessage(message, chatId);

        System.out.println("Message saved with ID: " + savedMessage.getId());
        System.out.println("=== END DEBUG SEND MESSAGE ===");

        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/debug/{chatId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatMessagesDebug(@PathVariable Long chatId) {
        System.out.println("=== DEBUG GET MESSAGES (NO AUTH) ===");
        System.out.println("Chat ID: " + chatId);

        List<ChatMessage> messages = chatService.getChatMessages(chatId);

        System.out.println("Found " + messages.size() + " messages");
        System.out.println("=== END DEBUG GET MESSAGES ===");

        return ResponseEntity.ok(messages);
    }

    @GetMapping("/debug/info/{chatId}")
    public ResponseEntity<ChatResponseDto> getChatInfoDebug(@PathVariable Long chatId) {
        System.out.println("=== DEBUG GET CHAT INFO (NO AUTH) ===");
        System.out.println("Chat ID: " + chatId);

        Chat chat = chatService.getChatById(chatId);
        ChatResponseDto response = convertToChatResponse(chat);

        System.out.println("Chat info retrieved: " + response.getId());
        System.out.println("=== END DEBUG GET CHAT INFO ===");

        return ResponseEntity.ok(response);
    }

    // Método helper para convertir Chat a ChatResponseDto
    private ChatResponseDto convertToChatResponse(Chat chat) {
        ChatResponseDto response = new ChatResponseDto();
        response.setId(chat.getId());
        response.setProductId(chat.getProduct().getProductId());

        // Convertir user1
        ChatResponseDto.UserBasicDto user1Dto = new ChatResponseDto.UserBasicDto();
        user1Dto.setId(chat.getUser1().getId());
        user1Dto.setEmail(chat.getUser1().getEmail());
        user1Dto.setFirstName(chat.getUser1().getFirstName());
        user1Dto.setLastName(chat.getUser1().getLastName());
        user1Dto.setLevel(chat.getUser1().getLevel());
        user1Dto.setPoints(chat.getUser1().getPoints());
        response.setUser1(user1Dto);

        // Convertir user2
        ChatResponseDto.UserBasicDto user2Dto = new ChatResponseDto.UserBasicDto();
        user2Dto.setId(chat.getUser2().getId());
        user2Dto.setEmail(chat.getUser2().getEmail());
        user2Dto.setFirstName(chat.getUser2().getFirstName());
        user2Dto.setLastName(chat.getUser2().getLastName());
        user2Dto.setLevel(chat.getUser2().getLevel());
        user2Dto.setPoints(chat.getUser2().getPoints());
        response.setUser2(user2Dto);

        // Convertir product
        ChatResponseDto.ProductBasicDto productDto = new ChatResponseDto.ProductBasicDto();
        productDto.setProductId(chat.getProduct().getProductId());
        productDto.setProductName(chat.getProduct().getProductName());
        productDto.setDescription(chat.getProduct().getDescription());
        response.setProduct(productDto);

        return response;
    }
}
