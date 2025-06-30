package com.greenloop.greenloop.chat.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "enabled", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired"})
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "enabled", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired"})
    private User user2;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Product product;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("chat")
    private List<ChatMessage> messages = new ArrayList<>();
}

