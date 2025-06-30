package com.greenloop.greenloop.chat.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.chat.infrastructure.ChatMessageRepository;
import com.greenloop.greenloop.chat.infrastructure.ChatRepository;
import com.greenloop.greenloop.product.domain.Product;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository messageRepository;
    private final com.greenloop.greenloop.product.infrastructure.ProductRepository productRepository;

    public Chat startChat(User user1, User user2, Long productId) {
        System.out.println("=== ChatService.startChat DEBUG ===");
        System.out.println("User1: " + user1.getId() + " - " + user1.getFirstName());
        System.out.println("User2: " + user2.getId() + " - " + user2.getFirstName());
        System.out.println("ProductId: " + productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        System.out.println("Product found: " + product.getProductId() + " - " + product.getProductName());

        // Buscar chat existente en ambas direcciones
        Optional<Chat> existingChat = chatRepository.findByUser1AndUser2AndProduct(user1, user2, product);
        if (existingChat.isEmpty()) {
            existingChat = chatRepository.findByUser1AndUser2AndProduct(user2, user1, product);
        }

        if (existingChat.isPresent()) {
            System.out.println("Existing chat found: " + existingChat.get().getId());
            return existingChat.get();
        }

        System.out.println("Creating new chat...");
        Chat chat = new Chat();
        chat.setUser1(user1);
        chat.setUser2(user2);
        chat.setProduct(product);
        Chat savedChat = chatRepository.save(chat);

        System.out.println("New chat saved with ID: " + savedChat.getId());
        System.out.println("=== END ChatService DEBUG ===");

        return savedChat;
    }

    public List<Chat> getUserChats(User user) {
        return chatRepository.findByUser1OrUser2(user, user);
    }

    public List<ChatMessage> getChatMessages(Long chatId) {
        return messageRepository.findByChatIdOrderBySentAtAsc(chatId);
    }

    public ChatMessage saveMessage(ChatMessage message, Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat no encontrado"));
        message.setChat(chat);
        return messageRepository.save(message);
    }

    public Chat getChatById(Long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat no encontrado"));
    }

    public List<Chat> getChatsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return chatRepository.findByProduct(product);
    }
}