package com.greenloop.greenloop.community.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.community.domain.CommunityService;
import com.greenloop.greenloop.community.dto.CommunityRequestDto;
import com.greenloop.greenloop.community.dto.CommunityResponseDto;
import com.greenloop.greenloop.community.dto.UserDto;
import com.greenloop.greenloop.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommunityController.class)
public class CommunityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CommunityService communityService;

    @MockitoBean
    private JwtService jwtService;

    private CommunityRequestDto requestDto;
    private CommunityResponseDto responseDto;
    private List<CommunityResponseDto> communitiesList;

    @BeforeEach
    void setUp() {
        // Set up request DTO
        requestDto = CommunityRequestDto.builder()
                .name("Test Community")
                .description("This is a test community")
                .build();

        // Set up user DTO for creator
        UserDto creatorDto = UserDto.builder()
                .id(1L)
                .username("johndoe")
                .build();

        // Set up members set
        Set<UserDto> members = new HashSet<>();
        members.add(creatorDto);

        // Set up response DTO
        responseDto = CommunityResponseDto.builder()
                .id(1L)
                .name("Test Community")
                .description("This is a test community")
                .creator(creatorDto)
                .members(members)
                .createdAt("2025-05-28 10:00:00")
                .memberCount(1)
                .build();

        // Set up communities list
        communitiesList = List.of(responseDto);
    }

    @Test
    @WithMockUser(username = "johndoe")
    void createCommunity_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(communityService.createCommunity(any(CommunityRequestDto.class), anyLong())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/communities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))  // Add CSRF token
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Community")))
                .andExpect(jsonPath("$.description", is("This is a test community")))
                .andExpect(jsonPath("$.creator.id", is(1)))
                .andExpect(jsonPath("$.creator.username", is("johndoe")))
                .andExpect(jsonPath("$.memberCount", is(1)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(communityService).createCommunity(any(CommunityRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "johndoe")
    void getAllCommunities_Success() throws Exception {
        // Given
        when(communityService.getAllCommunities()).thenReturn(communitiesList);

        // When & Then
        mockMvc.perform(get("/api/communities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Test Community")))
                .andExpect(jsonPath("$[0].description", is("This is a test community")));

        verify(communityService).getAllCommunities();
    }

    @Test
    @WithMockUser(username = "johndoe")
    void getCommunityById_Success() throws Exception {
        // Given
        when(communityService.getCommunityById(anyLong())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(get("/api/communities/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Community")))
                .andExpect(jsonPath("$.description", is("This is a test community")));

        verify(communityService).getCommunityById(1L);
    }

    @Test
    @WithMockUser(username = "johndoe")
    void joinCommunity_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(2L);

        // Create a response with updated members
        UserDto newMemberDto = UserDto.builder()
                .id(2L)
                .username("janedoe")
                .build();

        Set<UserDto> updatedMembers = new HashSet<>(responseDto.getMembers());
        updatedMembers.add(newMemberDto);

        CommunityResponseDto updatedResponse = CommunityResponseDto.builder()
                .id(1L)
                .name("Test Community")
                .description("This is a test community")
                .creator(responseDto.getCreator())
                .members(updatedMembers)
                .createdAt("2025-05-28 10:00:00")
                .memberCount(2)
                .build();

        when(communityService.joinCommunity(anyLong(), anyLong())).thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(post("/api/communities/1/join")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))  // Add CSRF token
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Community")))
                .andExpect(jsonPath("$.memberCount", is(2)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(communityService).joinCommunity(1L, 2L);
    }

    @Test
    @WithMockUser(username = "janedoe")
    void leaveCommunity_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(2L);
        when(communityService.leaveCommunity(anyLong(), anyLong())).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/communities/1/leave")
                .with(SecurityMockMvcRequestPostProcessors.csrf()))  // Add CSRF token
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Community")))
                .andExpect(jsonPath("$.memberCount", is(1)));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(communityService).leaveCommunity(1L, 2L);
    }

    @Test
    @WithMockUser(username = "johndoe")
    void getUserCommunities_Success() throws Exception {
        // Given
        when(jwtService.extractUserIdFromAuthentication(any(Authentication.class))).thenReturn(1L);
        when(communityService.getUserCommunities(anyLong())).thenReturn(communitiesList);

        // When & Then
        mockMvc.perform(get("/api/communities/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Test Community")))
                .andExpect(jsonPath("$[0].description", is("This is a test community")));

        verify(jwtService).extractUserIdFromAuthentication(any(Authentication.class));
        verify(communityService).getUserCommunities(1L);
    }

    // Test for validation errors
    @Test
    @WithMockUser(username = "johndoe")
    void createCommunity_ValidationErrors() throws Exception {
        // Given
        CommunityRequestDto invalidRequest = CommunityRequestDto.builder()
                .name("") // Empty name (should fail validation)
                .description("This is a test community")
                .build();

        // When & Then
        mockMvc.perform(post("/api/communities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))  // Add CSRF token
                .andExpect(status().isBadRequest());

        verify(communityService, never()).createCommunity(any(CommunityRequestDto.class), anyLong());
    }
}
