package com.greenloop.greenloop.message.application;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.message.domain.Message;
import com.greenloop.greenloop.message.domain.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest messageRequest) {
        Message message = messageService.sendMessage(
                messageRequest.getSender(),
                messageRequest.getReceiver(),
                messageRequest.getContent()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/chat")
    public ResponseEntity<List<Message>> getChatHistory(
            @RequestParam User user1,
            @RequestParam User user2) {
        List<Message> chatHistory = messageService.getChatHistory(user1, user2);
        return ResponseEntity.ok(chatHistory);
    }

    @GetMapping("/sender")
    public ResponseEntity<List<Message>> getMessagesBySender(@RequestParam User sender) {
        List<Message> messages = messageService.getMessagesBySender(sender);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/receiver")
    public ResponseEntity<List<Message>> getMessagesByReceiver(@RequestParam User receiver) {
        List<Message> messages = messageService.getMessagesByReceiver(receiver);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Message>> getMessagesByUser(@RequestParam User user) {
        List<Message> messages = messageService.getMessagesByUser(user);
        return ResponseEntity.ok(messages);
    }


    public static class MessageRequest {
        private User sender;
        private User receiver;
        private String content;

        public User getSender() {
            return sender;
        }

        public void setSender(User sender) {
            this.sender = sender;
        }

        public User getReceiver() {
            return receiver;
        }

        public void setReceiver(User receiver) {
            this.receiver = receiver;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
