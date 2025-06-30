package com.greenloop.greenloop.User.domain;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.greenloop.greenloop.community.domain.Community;
import com.greenloop.greenloop.post.domain.Post;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.wishlist.domain.WishList;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column()
    private Integer points;

    @Column()
    private String address;

    @Column()
    private ZonedDateTime joinedAt;

    @Column()
    private String level;

    @Column()
    private Integer itemsDonated;

    @Column()
    private Integer itemsExchanged;

    @Column()
    private Role role;

    @Column
    private String description;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Product> products;

    @OneToMany(mappedBy = "user")
    @OrderBy("publishedAt DESC")
    @JsonIgnore
    private List<Post> posts;

    @ManyToMany(mappedBy = "members")
    @JsonIgnore
    private Set<Community> communities = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<WishList> wishLists = new ArrayList<>();

    // Metodo auxiliar para agregar comunidad
    public void addCommunity(Community community) {
        communities.add(community);
    }

    // Metodo auxiliar para remover comunidad
    public void removeCommunity(Community community) {
        communities.remove(community);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
