package com.greenloop.greenloop.wishlist.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Product;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wishlists")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "wishList", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    // También podemos tener una lista de deseos de categorías o características
    @ElementCollection
    @CollectionTable(name = "wishlist_desired_categories", joinColumns = @JoinColumn(name = "wishlist_id"))
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<com.greenloop.greenloop.product.domain.Category> desiredCategories = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean isPublic;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Metodo de conveniencia para añadir un producto
    public void addProduct(Product product) {
        products.add(product);
        product.setWishList(this);
    }

    // Metodo de conveniencia para eliminar un producto
    public void removeProduct(Product product) {
        products.remove(product);
        product.setWishList(null);
    }
}