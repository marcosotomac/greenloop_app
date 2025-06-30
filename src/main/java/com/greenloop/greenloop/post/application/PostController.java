package com.greenloop.greenloop.post.application;

import com.greenloop.greenloop.post.domain.PostService;
import com.greenloop.greenloop.post.domain.Wanted;
import com.greenloop.greenloop.post.dto.PostRequestDto;
import com.greenloop.greenloop.post.dto.PostResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "API para gestión de publicaciones")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    @Operation(summary = "Obtiene todos los posts recientes")
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        List<PostResponseDto> posts = postService.findAllRecents();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/paginated")
    @Operation(summary = "Obtiene posts de forma paginada")
    public ResponseEntity<Page<PostResponseDto>> getPaginatedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy) {
        Page<PostResponseDto> posts = postService.getPaginatedPosts(page, size, sortBy);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    @Operation(summary = "Obtiene un post por su ID")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId) {
        PostResponseDto post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtiene posts por ID de usuario")
    public ResponseEntity<List<PostResponseDto>> getPostsByUserId(@PathVariable Long userId) {
        List<PostResponseDto> posts = postService.findPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/wanted/{wantedType}")
    @Operation(summary = "Filtra posts por tipo (DONATION, EXCHANGE)")
    public ResponseEntity<List<PostResponseDto>> getPostsByWanted(@PathVariable Wanted wantedType) {
        List<PostResponseDto> posts = postService.findPostsByWanted(wantedType);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/search")
    @Operation(summary = "Busca posts por palabra clave en título o contenido")
    public ResponseEntity<List<PostResponseDto>> searchPosts(@RequestParam String keyword) {
        List<PostResponseDto> posts = postService.searchPostsByKeyword(keyword);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/location")
    @Operation(summary = "Filtra posts por ubicación")
    public ResponseEntity<List<PostResponseDto>> getPostsByLocation(@RequestParam String location) {
        List<PostResponseDto> posts = postService.findPostsByLocation(location);
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Crea un nuevo post")
    public ResponseEntity<PostResponseDto> createPost(@Valid @RequestBody PostRequestDto postDto) {
        PostResponseDto createdPost = postService.createPost(postDto);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Actualiza un post existente")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostRequestDto postDto) {
        PostResponseDto updatedPost = postService.updatePost(postId, postDto);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Elimina un post (soft delete)")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Dar like a un post")
    public ResponseEntity<PostResponseDto> likePost(@PathVariable Long postId) {
        PostResponseDto post = postService.likePost(postId);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Quitar like de un post")
    public ResponseEntity<PostResponseDto> unlikePost(@PathVariable Long postId) {
        PostResponseDto post = postService.unlikePost(postId);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/{postId}/toggle-like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Alternar like en un post")
    public ResponseEntity<PostResponseDto> toggleLike(@PathVariable Long postId) {
        PostResponseDto post = postService.toggleLike(postId);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{postId}/likes/count")
    @Operation(summary = "Obtiene el número de likes de un post")
    public ResponseEntity<Integer> getLikesCount(@PathVariable Long postId) {
        int likesCount = postService.getLikesCount(postId);
        return ResponseEntity.ok(likesCount);
    }

    @GetMapping("/{postId}/likes/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verifica si el usuario actual dio like al post")
    public ResponseEntity<Boolean> hasUserLikedPost(@PathVariable Long postId) {
        boolean hasLiked = postService.hasUserLikedPost(postId);
        return ResponseEntity.ok(hasLiked);
    }
}
