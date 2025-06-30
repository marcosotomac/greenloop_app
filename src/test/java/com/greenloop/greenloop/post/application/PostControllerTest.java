package com.greenloop.greenloop.post.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.post.domain.Post;
import com.greenloop.greenloop.post.domain.PostService;
import com.greenloop.greenloop.post.domain.Wanted;
import com.greenloop.greenloop.post.dto.PostRequestDto;
import com.greenloop.greenloop.post.dto.PostResponseDto;
import com.greenloop.greenloop.post.exceptions.PostNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PostService postService;

    // Add these mock beans to satisfy Spring Security dependencies
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    private PostResponseDto testPostResponse;
    private PostRequestDto testPostRequest;
    private List<PostResponseDto> postList;

    @BeforeEach
    void setUp() {
        // Create test data
        BasicUserInfo userInfo = new BasicUserInfo();
        userInfo.setId(1L);
        userInfo.setFirstName("Test");
        userInfo.setLastName("User");

        testPostResponse = new PostResponseDto();
        testPostResponse.setPostId(1L);
        testPostResponse.setTitle("Test Post");
        testPostResponse.setContent("This is a test post content");
        testPostResponse.setImageUrl("http://example.com/image.jpg");
        testPostResponse.setWanted(Wanted.DONATION);
        testPostResponse.setLocation("Test Location");
        testPostResponse.setPublishedAt(LocalDateTime.now());
        testPostResponse.setUser(userInfo);

        // Create a second post for list testing
        PostResponseDto secondPost = new PostResponseDto();
        secondPost.setPostId(2L);
        secondPost.setTitle("Second Post");
        secondPost.setContent("This is the second test post content");
        secondPost.setImageUrl("http://example.com/image2.jpg");
        secondPost.setWanted(Wanted.EXCHANGE);
        secondPost.setLocation("Second Location");
        secondPost.setPublishedAt(LocalDateTime.now().minusDays(1));
        secondPost.setUser(userInfo);

        postList = Arrays.asList(testPostResponse, secondPost);

        // Create post request
        testPostRequest = new PostRequestDto();
        testPostRequest.setTitle("New Post");
        testPostRequest.setContent("New content");
        testPostRequest.setImageUrl("http://example.com/new-image.jpg");
        testPostRequest.setWanted(Wanted.EXCHANGE);
        testPostRequest.setLocation("New Location");
    }

    @Test
    @WithMockUser
    void getAllPosts_ShouldReturnListOfPosts() throws Exception {
        // Given
        when(postService.findAllRecents()).thenReturn(postList);

        // When & Then
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].postId", is(1)))
                .andExpect(jsonPath("$[0].title", is("Test Post")))
                .andExpect(jsonPath("$[1].postId", is(2)))
                .andExpect(jsonPath("$[1].title", is("Second Post")));
    }

    @Test
    @WithMockUser
    void getPaginatedPosts_ShouldReturnPagedPosts() throws Exception {
        // Given
        Page<PostResponseDto> pagedResponse = new PageImpl<>(postList);
        when(postService.getPaginatedPosts(anyInt(), anyInt(), anyString()))
                .thenReturn(pagedResponse);

        // When & Then
        mockMvc.perform(get("/api/posts/paginated")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "publishedAt"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].postId", is(1)))
                .andExpect(jsonPath("$.content[1].postId", is(2)));
    }

    @Test
    @WithMockUser
    void getPostById_WithValidId_ShouldReturnPost() throws Exception {
        // Given
        when(postService.getPostById(1L)).thenReturn(testPostResponse);

        // When & Then
        mockMvc.perform(get("/api/posts/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.postId", is(1)))
                .andExpect(jsonPath("$.title", is("Test Post")));
    }

    @Test
    @WithMockUser
    void getPostById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        // Given
        when(postService.getPostById(999L)).thenThrow(new PostNotFoundException(999L));

        // When & Then
        mockMvc.perform(get("/api/posts/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void getPostsByUserId_ShouldReturnUserPosts() throws Exception {
        // Given
        when(postService.findPostsByUserId(1L)).thenReturn(postList);

        // When & Then
        mockMvc.perform(get("/api/posts/user/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].postId", is(1)));
    }

    @Test
    @WithMockUser
    void getPostsByWanted_ShouldReturnFilteredPosts() throws Exception {
        // Given
        when(postService.findPostsByWanted(Wanted.DONATION))
                .thenReturn(Arrays.asList(testPostResponse));

        // When & Then
        mockMvc.perform(get("/api/posts/wanted/DONATION"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].wanted", is("DONATION")));
    }

    @Test
    @WithMockUser
    void searchPosts_ShouldReturnMatchingPosts() throws Exception {
        // Given
        String keyword = "test";
        when(postService.searchPostsByKeyword(keyword)).thenReturn(postList);

        // When & Then
        mockMvc.perform(get("/api/posts/search")
                .param("keyword", keyword))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @WithMockUser
    void getPostsByLocation_ShouldReturnPostsInLocation() throws Exception {
        // Given
        String location = "Test";
        when(postService.findPostsByLocation(location)).thenReturn(Arrays.asList(testPostResponse));

        // When & Then
        mockMvc.perform(get("/api/posts/location")
                .param("location", location))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].location", is("Test Location")));
    }

    @Test
    @WithMockUser
    void createPost_WithValidData_ShouldReturnCreatedPost() throws Exception {
        // Given
        when(postService.createPost(any(PostRequestDto.class))).thenReturn(testPostResponse);

        // When & Then
        mockMvc.perform(post("/api/posts")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPostRequest)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.title", is("Test Post")));
    }

    @Test
    @WithMockUser
    void updatePost_WithValidData_ShouldReturnUpdatedPost() throws Exception {
        // Given
        when(postService.updatePost(eq(1L), any(PostRequestDto.class))).thenReturn(testPostResponse);

        // When & Then
        mockMvc.perform(put("/api/posts/1")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPostRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.postId", is(1)))
                .andExpect(jsonPath("$.title", is("Test Post")));
    }

    @Test
    @WithMockUser
    void deletePost_WithValidId_ShouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(postService).deletePost(1L);

        // When & Then
        mockMvc.perform(delete("/api/posts/1")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void unauthorizedRequests_ShouldReturnUnauthorized() throws Exception {
        // Tests for endpoints that require authentication
        mockMvc.perform(post("/api/posts")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPostRequest)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/posts/1")
                .with(SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPostRequest)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/posts/1")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isUnauthorized());
    }
}
