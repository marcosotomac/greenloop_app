package com.greenloop.greenloop.chat.application;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.chat.domain.ChatMessage;
import com.greenloop.greenloop.chat.domain.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final com.greenloop.greenloop.User.infrastructure.UserRepository userRepository;

    @MessageMapping("/chat.sendMessage/{chatId}")
    @SendTo("/topic/chat/{chatId}")
    public ChatMessage sendMessage(@DestinationVariable Long chatId, @Payload ChatMessage chatMessage) {
        User sender = userRepository.findById(chatMessage.getSender().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        chatMessage.setSender(sender);

        // Guardar mensaje en la base de datos
        ChatMessage savedMessage = chatService.saveMessage(chatMessage, chatId);

        // Notificar al otro usuario sobre el nuevo mensaje
        Chat chat = chatService.getChatById(chatId);
        Long recipientId;

        if (chat.getUser1().getId().equals(sender.getId())) {
            recipientId = chat.getUser2().getId();
        } else {
            recipientId = chat.getUser1().getId();
        }

        // Enviar notificación de nuevo mensaje
        messagingTemplate.convertAndSend("/topic/notifications/" + recipientId,
                new ChatNotification(savedMessage.getId(), savedMessage.getSender().getId(), chatId));

        return savedMessage;
    }

    @MessageMapping("/chat.typing/{chatId}")
    @SendTo("/topic/chat/{chatId}")
    public TypingStatus sendTypingStatus(@DestinationVariable Long chatId, @Payload TypingStatus typingStatus) {
        return typingStatus;
    }

    public static class ChatNotification {
        private Long messageId;
        private Long senderId;
        private Long chatId;

        public ChatNotification(Long messageId, Long senderId, Long chatId) {
            this.messageId = messageId;
            this.senderId = senderId;
            this.chatId = chatId;
        }

        // Getters y setters
        public Long getMessageId() {
            return messageId;
        }

        public void setMessageId(Long messageId) {
            this.messageId = messageId;
        }

        public Long getSenderId() {
            return senderId;
        }

        public void setSenderId(Long senderId) {
            this.senderId = senderId;
        }

        public Long getChatId() {
            return chatId;
        }

        public void setChatId(Long chatId) {
            this.chatId = chatId;
        }
    }

    public static class TypingStatus {
        private Long userId;
        private boolean typing;

        // Getters y setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public boolean isTyping() {
            return typing;
        }

        public void setTyping(boolean typing) {
            this.typing = typing;
        }
    }
}