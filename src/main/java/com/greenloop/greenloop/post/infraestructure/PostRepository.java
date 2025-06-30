package com.greenloop.greenloop.post.infraestructure;

import com.greenloop.greenloop.post.domain.Post;
import com.greenloop.greenloop.post.domain.Wanted;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Buscar posts recientes
    List<Post> findAllByOrderByPublishedAtDesc();

    // Buscar posts paginados y ordenados por fecha
    Page<Post> findByActiveTrue(Pageable pageable);

    // Buscar posts de un usuario específico
    List<Post> findByUserIdOrderByPublishedAtDesc(Long userId);

    // Alias del método anterior para compatibilidad
    default List<Post> findPostByUserId(Long userId) {
        return findByUserIdOrderByPublishedAtDesc(userId);
    }

    // Buscar posts por el tipo de "wanted"
    List<Post> findByWantedAndActiveTrue(Wanted wanted);

    // Buscar posts por título o contenido (para búsquedas)
    @Query("SELECT p FROM Post p WHERE (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.active = true")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    // Buscar posts por ubicación
    List<Post> findByLocationContainingIgnoreCaseAndActiveTrue(String location);

    // Verificar si un usuario es dueño de un post
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    // Para optimizar la eficiencia en las validaciones
    Optional<Post> findByPostIdAndActive(Long postId, boolean active);
}
