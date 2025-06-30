package com.greenloop.greenloop.post.infraestructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.post.domain.Post;
import com.greenloop.greenloop.post.domain.PostLike;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // Verificar si un usuario ya dio like a un post
    boolean existsByPostAndUser(Post post, User user);

    // Obtener el like específico de un usuario para un post
    Optional<PostLike> findByPostAndUser(Post post, User user);

    // Contar el número total de likes de un post
    long countByPost(Post post);

    // Obtener todos los likes de un post
    List<PostLike> findByPost(Post post);

    // Obtener todos los posts que le gustaron a un usuario
    List<PostLike> findByUser(User user);

    // Query para obtener los posts más populares (con más likes)
    @Query("SELECT pl.post, COUNT(pl) as likeCount FROM PostLike pl " +
            "GROUP BY pl.post ORDER BY likeCount DESC")
    List<Object[]> findMostLikedPosts();

    // Query para obtener el número de likes por post ID
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.post.postId = :postId")
    long countLikesByPostId(@Param("postId") Long postId);

    // Verificar si un usuario específico dio like a un post específico
    @Query("SELECT CASE WHEN COUNT(pl) > 0 THEN true ELSE false END " +
            "FROM PostLike pl WHERE pl.post.postId = :postId AND pl.user.id = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
}
