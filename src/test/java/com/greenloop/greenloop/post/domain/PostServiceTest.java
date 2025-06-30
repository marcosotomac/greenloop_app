package com.greenloop.greenloop.post.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.post.dto.PostRequestDto;
import com.greenloop.greenloop.post.dto.PostResponseDto;
import com.greenloop.greenloop.post.exceptions.InvalidPostDataException;
import com.greenloop.greenloop.post.exceptions.PostAuthorizationException;
import com.greenloop.greenloop.post.exceptions.PostNotFoundException;
import com.greenloop.greenloop.post.infraestructure.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private PostService postService;

    private User testUser;
    private Post testPost;
    private PostRequestDto requestDto;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(Role.valueOf("USER"));

        // Setup test post
        testPost = new Post();
        testPost.setPostId(1L);
        testPost.setTitle("Test Post");
        testPost.setContent("This is a test post content");
        testPost.setPublishedAt(LocalDateTime.now());
        testPost.setImageUrl("http://example.com/image.jpg");
        testPost.setWanted(Wanted.DONATION);
        testPost.setLocation("Test Location");
        testPost.setActive(true);
        testPost.setUser(testUser);

        // Setup PostRequestDto
        requestDto = new PostRequestDto();
        requestDto.setTitle("New Post");
        requestDto.setContent("New content");
        requestDto.setImageUrl("http://example.com/new-image.jpg");
        requestDto.setWanted(Wanted.EXCHANGE);
        requestDto.setLocation("New Location");

        // Mock the security context
        SecurityContextHolder.setContext(securityContext);
    }

    private void mockAuthenticatedUser() {
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUsername()).thenReturn("test@example.com");
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
    }

    @Test
    void createPost_ShouldCreateAndReturnPost() {
        // Given
        mockAuthenticatedUser();
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post savedPost = invocation.getArgument(0);
            savedPost.setPostId(1L);
            savedPost.setPublishedAt(LocalDateTime.now());
            return savedPost;
        });

        // When
        PostResponseDto result = postService.createPost(requestDto);

        // Then
        assertNotNull(result);
        assertEquals(requestDto.getTitle(), result.getTitle());
        assertEquals(requestDto.getContent(), result.getContent());
        assertEquals(requestDto.getImageUrl(), result.getImageUrl());
        assertEquals(requestDto.getWanted(), result.getWanted());
        assertEquals(requestDto.getLocation(), result.getLocation());
        assertEquals(testUser.getId(), result.getUser().getId());

        // Verify the post was saved
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository).save(postCaptor.capture());
        Post capturedPost = postCaptor.getValue();
        assertEquals(requestDto.getTitle(), capturedPost.getTitle());
        assertEquals(testUser, capturedPost.getUser());
    }

    @Test
    void createPost_WithInvalidData_ShouldThrowException() {
        // Given
        mockAuthenticatedUser();
        PostRequestDto invalidDto = new PostRequestDto();
        invalidDto.setTitle("");  // Empty title

        // When & Then
        assertThrows(InvalidPostDataException.class, () -> postService.createPost(invalidDto));

        // Verify no post was saved
        verify(postRepository, never()).save(any());
    }

    @Test
    void updatePost_ByOwner_ShouldUpdateAndReturnPost() {
        // Given
        mockAuthenticatedUser();
        when(postRepository.findById(anyLong())).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        PostResponseDto result = postService.updatePost(1L, requestDto);

        // Then
        assertNotNull(result);
        assertEquals(requestDto.getTitle(), result.getTitle());
        assertEquals(requestDto.getContent(), result.getContent());
        assertEquals(requestDto.getImageUrl(), result.getImageUrl());
        assertEquals(requestDto.getWanted(), result.getWanted());
        assertEquals(requestDto.getLocation(), result.getLocation());

        // Verify the post was updated
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository).save(postCaptor.capture());
        Post capturedPost = postCaptor.getValue();
        assertEquals(requestDto.getTitle(), capturedPost.getTitle());
    }

    @Test
    void updatePost_ByNonOwner_ShouldThrowException() {
        // Given
        mockAuthenticatedUser();

        // Create another user as the post owner
        User anotherUser = new User();
        anotherUser.setId(2L);
        anotherUser.setFirstName("Another");
        anotherUser.setLastName("User");

        Post post = new Post();
        post.setPostId(1L);
        post.setUser(anotherUser);

        when(postRepository.findById(anyLong())).thenReturn(Optional.of(post));

        // When & Then
        assertThrows(PostAuthorizationException.class, () -> postService.updatePost(1L, requestDto));

        // Verify no post was saved
        verify(postRepository, never()).save(any());
    }

    @Test
    void deletePost_ByOwner_ShouldMarkPostAsInactive() {
        // Given
        mockAuthenticatedUser();
        when(postRepository.findById(anyLong())).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        postService.deletePost(1L);

        // Then
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository).save(postCaptor.capture());
        Post capturedPost = postCaptor.getValue();
        assertFalse(capturedPost.isActive());
    }

    @Test
    void deletePost_ByAdmin_ShouldAllowDeletion() {
        // Given
        mockAuthenticatedUser();
        testUser.setRole(Role.valueOf("ADMIN"));

        // Create another user as the post owner
        User anotherUser = new User();
        anotherUser.setId(2L);

        Post post = new Post();
        post.setPostId(1L);
        post.setUser(anotherUser);

        when(postRepository.findById(anyLong())).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        postService.deletePost(1L);

        // Then
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository).save(postCaptor.capture());
        Post capturedPost = postCaptor.getValue();
        assertFalse(capturedPost.isActive());
    }

    @Test
    void deletePost_ByNonOwnerNonAdmin_ShouldThrowException() {
        // Given
        mockAuthenticatedUser();

        // Create another user as the post owner
        User anotherUser = new User();
        anotherUser.setId(2L);

        Post post = new Post();
        post.setPostId(1L);
        post.setUser(anotherUser);

        when(postRepository.findById(anyLong())).thenReturn(Optional.of(post));

        // When & Then
        assertThrows(PostAuthorizationException.class, () -> postService.deletePost(1L));

        // Verify no post was saved
        verify(postRepository, never()).save(any());
    }

    @Test
    void getPostById_WithValidId_ShouldReturnPost() {
        // Given
        when(postRepository.findByPostIdAndActive(anyLong(), eq(true))).thenReturn(Optional.of(testPost));

        // When
        PostResponseDto result = postService.getPostById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testPost.getPostId(), result.getPostId());
        assertEquals(testPost.getTitle(), result.getTitle());
    }

    @Test
    void getPostById_WithInvalidId_ShouldThrowException() {
        // Given
        when(postRepository.findByPostIdAndActive(anyLong(), eq(true))).thenReturn(Optional.empty());

        // When & Then
        assertThrows(PostNotFoundException.class, () -> postService.getPostById(999L));
    }

    @Test
    void findAllRecents_ShouldReturnRecentPosts() {
        // Given
        Post post1 = new Post();
        post1.setPostId(1L);
        post1.setTitle("Post 1");
        post1.setActive(true);
        post1.setUser(testUser);

        Post post2 = new Post();
        post2.setPostId(2L);
        post2.setTitle("Post 2");
        post2.setActive(true);
        post2.setUser(testUser);

        Post inactivePost = new Post();
        inactivePost.setPostId(3L);
        inactivePost.setTitle("Inactive Post");
        inactivePost.setActive(false);
        inactivePost.setUser(testUser);

        List<Post> posts = Arrays.asList(post1, post2, inactivePost);

        when(postRepository.findAllByOrderByPublishedAtDesc()).thenReturn(posts);

        // When
        List<PostResponseDto> result = postService.findAllRecents();

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> Arrays.asList("Post 1", "Post 2").contains(p.getTitle())));
    }

    @Test
    void getPaginatedPosts_ShouldReturnPageOfPosts() {
        // Given
        List<Post> posts = Arrays.asList(testPost);
        Page<Post> postPage = new PageImpl<>(posts);

        when(postRepository.findByActiveTrue(any(Pageable.class))).thenReturn(postPage);

        // When
        Page<PostResponseDto> result = postService.getPaginatedPosts(0, 10, "publishedAt");

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void findPostsByUserId_ShouldReturnUserPosts() {
        // Given
        Post post1 = new Post();
        post1.setPostId(1L);
        post1.setTitle("Post 1");
        post1.setActive(true);
        post1.setUser(testUser);

        Post post2 = new Post();
        post2.setPostId(2L);
        post2.setTitle("Post 2");
        post2.setActive(true);
        post2.setUser(testUser);

        Post inactivePost = new Post();
        inactivePost.setPostId(3L);
        inactivePost.setTitle("Inactive Post");
        inactivePost.setActive(false);
        inactivePost.setUser(testUser);

        List<Post> posts = Arrays.asList(post1, post2, inactivePost);

        when(postRepository.findByUserIdOrderByPublishedAtDesc(anyLong())).thenReturn(posts);

        // When
        List<PostResponseDto> result = postService.findPostsByUserId(1L);

        // Then
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> Arrays.asList("Post 1", "Post 2").contains(p.getTitle())));
    }

    @Test
    void findPostsByWanted_ShouldReturnFilteredPosts() {
        // Given
        Post post1 = new Post();
        post1.setPostId(1L);
        post1.setTitle("Donation Post");
        post1.setWanted(Wanted.DONATION);
        post1.setUser(testUser);

        List<Post> posts = Arrays.asList(post1);

        when(postRepository.findByWantedAndActiveTrue(eq(Wanted.DONATION))).thenReturn(posts);

        // When
        List<PostResponseDto> result = postService.findPostsByWanted(Wanted.DONATION);

        // Then
        assertEquals(1, result.size());
        assertEquals("Donation Post", result.get(0).getTitle());
        assertEquals(Wanted.DONATION, result.get(0).getWanted());
    }

    @Test
    void searchPostsByKeyword_ShouldReturnMatchingPosts() {
        // Given
        Post post1 = new Post();
        post1.setPostId(1L);
        post1.setTitle("Special Post");
        post1.setUser(testUser);

        List<Post> posts = Arrays.asList(post1);

        when(postRepository.searchByKeyword(anyString())).thenReturn(posts);

        // When
        List<PostResponseDto> result = postService.searchPostsByKeyword("Special");

        // Then
        assertEquals(1, result.size());
        assertEquals("Special Post", result.get(0).getTitle());
    }

    @Test
    void findPostsByLocation_ShouldReturnPostsInLocation() {
        // Given
        Post post1 = new Post();
        post1.setPostId(1L);
        post1.setTitle("Madrid Post");
        post1.setLocation("Madrid");
        post1.setUser(testUser);

        List<Post> posts = Arrays.asList(post1);

        when(postRepository.findByLocationContainingIgnoreCaseAndActiveTrue(anyString())).thenReturn(posts);

        // When
        List<PostResponseDto> result = postService.findPostsByLocation("Madrid");

        // Then
        assertEquals(1, result.size());
        assertEquals("Madrid Post", result.get(0).getTitle());
    }
}
