package com.greenloop.greenloop.wishlist.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.wishlist.domain.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    List<WishList> findByUser(User user);

    // Encuentra listas de deseos que incluyan una categoría específica
    @Query("SELECT w FROM WishList w JOIN w.desiredCategories c WHERE c = :category AND (w.isPublic = true OR w.user = :user)")
    List<WishList> findByDesiredCategoryAndUserOrPublic(Category category, User user);

    // Encuentra listas de deseos públicas
    List<WishList> findByIsPublicTrue();

    // Verifica si un usuario es dueño de una lista de deseos
    boolean existsByIdAndUser(Long id, User user);

    // Encuentra listas de deseos de un usuario que contienen un producto específico
    @Query("SELECT w FROM WishList w JOIN w.products p WHERE p.productId = :productId AND w.user = :user")
    List<WishList> findByUserAndProduct(User user, Long productId);

    Optional<WishList> findByIdAndUser(Long id, User user);
}