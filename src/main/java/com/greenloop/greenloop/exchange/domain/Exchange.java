package com.greenloop.greenloop.exchange.domain;


import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "exchanges")
public class Exchange {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long exchangeId;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private User provider;

    @ManyToOne
    @JoinColumn(name = "requested_product_id")
    private Product requestedProduct;

    @ManyToOne
    @JoinColumn(name = "offered_product_id")
    private Product offeredProduct;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Column
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExchangeStatus status;


    @PrePersist
    public void prePersist() {
        this.requestedAt = LocalDateTime.now();
        this.status = ExchangeStatus.PENDING;
    }



}
