package com.greenloop.greenloop.message.domain;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.message.infraestructure.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public Message sendMessage(User sender, User receiver, String content) {
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(User user1, User user2) {
        List<Message> sentMessages = messageRepository.findBySenderAndReceiver(user1, user2);
        List<Message> receivedMessages = messageRepository.findByReceiverAndSender(user1, user2);
        sentMessages.addAll(receivedMessages);
        sentMessages.sort((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()));
        return sentMessages;
    };

    public List<Message> getMessagesBySender(User sender) {
        return messageRepository.findBySenderAndReceiver(sender, null);
    }

    public List<Message> getMessagesByReceiver(User receiver) {
        return messageRepository.findBySenderAndReceiver(null, receiver);
    }

    public List<Message> getMessagesByUser(User user) {
        List<Message> sentMessages = messageRepository.findBySenderAndReceiver(user, null);
        List<Message> receivedMessages = messageRepository.findBySenderAndReceiver(null, user);
        sentMessages.addAll(receivedMessages);
        return sentMessages;
    }
}
