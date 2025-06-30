package com.greenloop.greenloop.donation.domain;

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
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private User donor;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private LocalDateTime donationDate;

    @Column
    private LocalDateTime receivedDate;

    @Enumerated(EnumType.STRING)
    private DonationStatus status;

    @Column
    private String donationLocation;

    @Column
    private String receiverNote;

    @Column
    private String donorNote;

    @Column
    private Integer pointsAwarded;

    @PrePersist
    protected void onCreate() {
        donationDate = LocalDateTime.now();
        if (status == null) {
            status = DonationStatus.PENDING;
        }
    }
}