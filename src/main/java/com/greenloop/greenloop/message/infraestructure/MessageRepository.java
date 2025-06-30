package com.greenloop.greenloop.message.infraestructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.message.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiver(User sender, User receiver);

    List<Message> findByReceiverAndSender(User receiver, User sender);

}
