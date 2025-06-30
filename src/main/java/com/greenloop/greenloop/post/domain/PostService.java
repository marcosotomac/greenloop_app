package com.greenloop.greenloop.post.domain;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.post.dto.PostRequestDto;
import com.greenloop.greenloop.post.dto.PostResponseDto;
import com.greenloop.greenloop.post.exceptions.InvalidPostDataException;
import com.greenloop.greenloop.post.exceptions.PostAuthorizationException;
import com.greenloop.greenloop.post.exceptions.PostNotFoundException;
import com.greenloop.greenloop.post.infraestructure.PostRepository;
import com.greenloop.greenloop.post.infraestructure.PostLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    /**
     * Obtiene el usuario actualmente autenticado
     */
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Si el principal es un UserDetails, obtiene el username
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            // A veces el principal puede ser solo el username como String
            username = (String) principal;
        } else {
            throw new PostAuthorizationException("Usuario no autenticado o formato de autenticación no reconocido");
        }

        User user = userRepository.findByEmail(username);
        if (user == null) {
            throw new PostAuthorizationException("Usuario no encontrado: " + username);
        }

        return user;
    }

    /**
     * Convierte una entidad Post a un DTO de respuesta
     */
    private PostResponseDto mapToResponseDto(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setPostId(post.getPostId());
        dto.setUsername(post.getUsername());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setWanted(post.getWanted());
        dto.setLocation(post.getLocation());
        dto.setPublishedAt(post.getPublishedAt());

        // Mapear información básica del usuario
        BasicUserInfo userInfo = new BasicUserInfo();
        userInfo.setId(post.getUser().getId());
        userInfo.setFirstName(post.getUser().getFirstName());
        userInfo.setLastName(post.getUser().getLastName());
        dto.setUser(userInfo);

        // Mapear información de likes
        dto.setLikesCount((int) postLikeRepository.countByPost(post));

        // Verificar si el usuario actual dio like al post
        try {
            User currentUser = getCurrentUser();
            dto.setLikedByCurrentUser(postLikeRepository.existsByPostAndUser(post, currentUser));
        } catch (Exception e) {
            // Si no hay usuario autenticado, establecer como false
            dto.setLikedByCurrentUser(false);
        }

        return dto;
    }

    /**
     * Crea un nuevo post a partir de los datos de un DTO
     */
    @Transactional
    public PostResponseDto createPost(PostRequestDto postDto) {
        if (postDto.getTitle() == null || postDto.getTitle().trim().isEmpty()) {
            throw new InvalidPostDataException("El título del post no puede estar vacío");
        }
        if (postDto.getContent() == null || postDto.getContent().trim().isEmpty()) {
            throw new InvalidPostDataException("El contenido del post no puede estar vacío");
        }
        if (postDto.getWanted() == null) {
            throw new InvalidPostDataException("Debe especificar el tipo de post (DONATION, EXCHANGE)");
        }

        User user = getCurrentUser();

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setUsername(user.getUsername());
        post.setContent(postDto.getContent());
        post.setImageUrl(postDto.getImageUrl());
        post.setWanted(postDto.getWanted());
        post.setLocation(postDto.getLocation());
        post.setUser(user);

        Post savedPost = postRepository.save(post);
        return mapToResponseDto(savedPost);
    }

    /**
     * Actualiza un post existente
     */
    @Transactional
    public PostResponseDto updatePost(Long postId, PostRequestDto postDto) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        // Verificar que el usuario actual es el dueño del post
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new PostAuthorizationException("No tienes permiso para editar este post");
        }

        if (postDto.getTitle() != null && !postDto.getTitle().trim().isEmpty()) {
            post.setTitle(postDto.getTitle());
        }

        if (postDto.getContent() != null && !postDto.getContent().trim().isEmpty()) {
            post.setContent(postDto.getContent());
        }

        post.setImageUrl(postDto.getImageUrl());

        if (postDto.getWanted() != null) {
            post.setWanted(postDto.getWanted());
        }

        if (postDto.getLocation() != null && !postDto.getLocation().trim().isEmpty()) {
            post.setLocation(postDto.getLocation());
        }

        Post updatedPost = postRepository.save(post);
        return mapToResponseDto(updatedPost);
    }

    /**
     * Elimina un post (soft delete)
     */
    @Transactional
    public void deletePost(Long postId) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        // Verificar que el usuario actual es el dueño del post o es un administrador
        if (!post.getUser().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().name().equals("ADMIN")) {
            throw new PostAuthorizationException("No tienes permiso para eliminar este post");
        }

        post.setActive(false);
        postRepository.save(post);
    }

    /**
     * Obtiene un post por su ID
     */
    public PostResponseDto getPostById(Long postId) {
        Post post = postRepository.findByPostIdAndActive(postId, true)
                .orElseThrow(() -> new PostNotFoundException(postId));

        return mapToResponseDto(post);
    }

    /**
     * Obtiene todos los posts recientes
     */
    public List<PostResponseDto> findAllRecents() {
        return postRepository.findAllByOrderByPublishedAtDesc().stream()
                .filter(Post::isActive)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los posts de un usuario específico
     */
    public List<PostResponseDto> findPostsByUserId(Long userId) {
        return postRepository.findByUserIdOrderByPublishedAtDesc(userId).stream()
                .filter(Post::isActive)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Encuentra posts por el tipo de "wanted" (DONATION, EXCHANGE)
     */
    public List<PostResponseDto> findPostsByWanted(Wanted wanted) {
        return postRepository.findByWantedAndActiveTrue(wanted).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca posts por una palabra clave en título o contenido
     */
    public List<PostResponseDto> searchPostsByKeyword(String keyword) {
        return postRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene posts paginados
     */
    public Page<PostResponseDto> getPaginatedPosts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        Page<Post> postPage = postRepository.findByActiveTrue(pageable);

        return postPage.map(this::mapToResponseDto);
    }

    /**
     * Busca posts por ubicación
     */
    public List<PostResponseDto> findPostsByLocation(String location) {
        return postRepository.findByLocationContainingIgnoreCaseAndActiveTrue(location).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Dar like a un post
     */
    @Transactional
    public PostResponseDto likePost(Long postId) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        // Verificar si ya existe el like
        if (postLikeRepository.existsByPostAndUser(post, currentUser)) {
            throw new IllegalStateException("El usuario ya dio like a este post");
        }

        // Crear el like
        PostLike postLike = new PostLike();
        postLike.setPost(post);
        postLike.setUser(currentUser);
        postLikeRepository.save(postLike);

        return mapToResponseDto(post);
    }

    /**
     * Quitar like de un post
     */
    @Transactional
    public PostResponseDto unlikePost(Long postId) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        // Buscar el like existente
        PostLike postLike = postLikeRepository.findByPostAndUser(post, currentUser)
                .orElseThrow(() -> new IllegalStateException("El usuario no ha dado like a este post"));

        // Eliminar el like
        postLikeRepository.delete(postLike);

        return mapToResponseDto(post);
    }

    /**
     * Alternar like en un post (dar like si no lo tiene, quitarlo si ya lo tiene)
     */
    @Transactional
    public PostResponseDto toggleLike(Long postId) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        boolean hasLiked = postLikeRepository.existsByPostAndUser(post, currentUser);

        if (hasLiked) {
            // Quitar like
            PostLike postLike = postLikeRepository.findByPostAndUser(post, currentUser)
                    .orElseThrow(() -> new IllegalStateException("Error al buscar el like"));
            postLikeRepository.delete(postLike);
        } else {
            // Dar like
            PostLike postLike = new PostLike();
            postLike.setPost(post);
            postLike.setUser(currentUser);
            postLikeRepository.save(postLike);
        }

        return mapToResponseDto(post);
    }

    /**
     * Obtener el número de likes de un post
     */
    public int getLikesCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        return (int) postLikeRepository.countByPost(post);
    }

    /**
     * Verificar si el usuario actual dio like a un post
     */
    public boolean hasUserLikedPost(Long postId) {
        try {
            User currentUser = getCurrentUser();
            return postLikeRepository.existsByPostIdAndUserId(postId, currentUser.getId());
        } catch (Exception e) {
            return false;
        }
    }
}
