package com.greenloop.greenloop.chat.infrastructure;

import com.greenloop.greenloop.chat.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE m.chat.id = :chatId ORDER BY m.sentAt ASC")
    List<ChatMessage> findByChatIdOrderBySentAtAsc(Long chatId);
}