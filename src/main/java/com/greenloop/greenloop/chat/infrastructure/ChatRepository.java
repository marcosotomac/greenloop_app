package com.greenloop.greenloop.chat.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.chat.domain.Chat;
import com.greenloop.greenloop.product.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUser1OrUser2(User user1, User user2);

    Optional<Chat> findByUser1AndUser2AndProduct(User user1, User user2, Product product);

    List<Chat> findByProduct(Product product);
}


