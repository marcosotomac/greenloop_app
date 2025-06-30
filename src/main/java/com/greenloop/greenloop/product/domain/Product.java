package com.greenloop.greenloop.product.domain;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.exchange.domain.Exchange;
import com.greenloop.greenloop.wishlist.domain.WishList;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(nullable = false) // Pre asisted
    private String ownerName;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Condition condition;

    // Nuevo campo para indicar si el producto está disponible para intercambio
    @Column(nullable = false)
    private boolean availableForExchange;

    // Nuevo campo para establecer preferencias de intercambio
    @Column
    private String exchangePreferences;

    // Nuevo campo para indicar el valor estimado del producto (para intercambios
    // más justos)
    @Column
    private Double estimatedValue;

    // Fecha de creación del producto
    @Column(nullable = false) // Pre asisted
    private LocalDateTime createdAt;

    // Estado del producto (ACTIVE, EXCHANGED, DONATED, INACTIVE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) // Pre asisted
    private ProductStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "wishlist_id")
    private WishList wishList;

    // Nueva relación para rastrear los intercambios donde este producto fue
    // solicitado
    @OneToMany(mappedBy = "requestedProduct")
    @JsonIgnore
    private List<Exchange> requestedExchanges;

    // Nueva relación para rastrear los intercambios donde este producto fue
    // ofrecido
    @OneToMany(mappedBy = "offeredProduct")
    @JsonIgnore
    private List<Exchange> offeredExchanges;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.ownerName = this.user.getFirstName() + " " + this.user.getLastName();
        this.status = ProductStatus.ACTIVE;
        if (this.estimatedValue == null) {
            this.estimatedValue = 0.0;
        }
        // Los usuarios deben activar manualmente el intercambio según sus preferencias
    }

    public boolean canBeExchanged() {
        return this.availableForExchange && this.status == ProductStatus.ACTIVE;
    }
}
