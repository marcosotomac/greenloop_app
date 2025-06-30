package com.greenloop.greenloop.community.domain;

import com.greenloop.greenloop.User.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Table(name = "communities")
@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CommunityType type = CommunityType.PUBLIC;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToMany
    @JoinTable(name = "community_members", joinColumns = @JoinColumn(name = "community_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default // This tells Lombok to use the default value even with builder
    private Set<User> members = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void addMember(User user) {
        // Ensure members is initialized
        if (members == null) {
            members = new HashSet<>();
        }
        members.add(user);
    }

    public void removeMember(User user) {
        // Ensure members is initialized
        if (members == null) {
            return; // Can't remove from null set
        }
        members.remove(user);
    }
}
