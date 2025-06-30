package com.greenloop.greenloop.community.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.community.dto.CommunityRequestDto;
import com.greenloop.greenloop.community.dto.CommunityResponseDto;
import com.greenloop.greenloop.community.infrastructure.CommunityRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommunityServiceTest {

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommunityService communityService;

    private User testUser;
    private Community testCommunity;
    private CommunityRequestDto requestDto;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @BeforeEach
    void setUp() {
        // Setup user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.USER);
        testUser.setCommunities(new HashSet<>());

        // Setup community - Initialize members set explicitly
        testCommunity = Community.builder()
                .id(1L)
                .name("Test Community")
                .description("This is a test community")
                .creator(testUser)
                .members(new HashSet<>(Collections.singletonList(testUser)))  // Initialize with HashSet
                .createdAt(LocalDateTime.now())
                .build();

        testUser.getCommunities().add(testCommunity);

        // Setup request DTO
        requestDto = CommunityRequestDto.builder()
                .name("Test Community")
                .description("This is a test community")
                .build();
    }

    @Test
    void createCommunity_Success() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(communityRepository.existsByName(anyString())).thenReturn(false);

        // Setup to properly set ID and initialize members set when saving
        when(communityRepository.save(any(Community.class))).thenAnswer(invocation -> {
            Community savedCommunity = invocation.getArgument(0);
            if (savedCommunity.getId() == null) {
                savedCommunity.setId(1L);
            }
            // Make sure members is initialized
            if (savedCommunity.getMembers() == null) {
                savedCommunity.setMembers(new HashSet<>());
            }
            savedCommunity.setCreatedAt(LocalDateTime.now());
            return savedCommunity;
        });

        // When
        CommunityResponseDto responseDto = communityService.createCommunity(requestDto, 1L);

        // Then
        verify(userRepository).findById(1L);
        verify(communityRepository).existsByName("Test Community");
        verify(communityRepository).save(any(Community.class));
        verify(userRepository).save(testUser);

        // Verify response
        assertNotNull(responseDto);
        assertEquals("Test Community", responseDto.getName());
        assertEquals("This is a test community", responseDto.getDescription());
        assertEquals(1L, responseDto.getCreator().getId());
        assertEquals(1, responseDto.getMemberCount());
    }

    @Test
    void createCommunity_CommunityNameExists_ThrowsIllegalArgumentException() {
        // Given
        when(communityRepository.existsByName(anyString())).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            communityService.createCommunity(requestDto, 1L)
        );

        assertEquals("Ya existe una comunidad con ese nombre", exception.getMessage());
        verify(communityRepository).existsByName("Test Community");
        verify(communityRepository, never()).save(any(Community.class));
    }

    @Test
    void createCommunity_UserNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(communityRepository.existsByName(anyString())).thenReturn(false);
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
            communityService.createCommunity(requestDto, 1L)
        );

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(communityRepository).existsByName("Test Community");
        verify(communityRepository, never()).save(any(Community.class));
    }

    @Test
    void getAllCommunities_Success() {
        // Given
        List<Community> communities = List.of(testCommunity);
        when(communityRepository.findAll()).thenReturn(communities);

        // When
        List<CommunityResponseDto> responseDtos = communityService.getAllCommunities();

        // Then
        verify(communityRepository).findAll();
        assertNotNull(responseDtos);
        assertEquals(1, responseDtos.size());

        CommunityResponseDto responseDto = responseDtos.get(0);
        assertEquals(1L, responseDto.getId());
        assertEquals("Test Community", responseDto.getName());
        assertEquals("This is a test community", responseDto.getDescription());
    }

    @Test
    void getCommunityById_Success() {
        // Given
        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));

        // When
        CommunityResponseDto responseDto = communityService.getCommunityById(1L);

        // Then
        verify(communityRepository).findById(1L);
        assertNotNull(responseDto);
        assertEquals(1L, responseDto.getId());
        assertEquals("Test Community", responseDto.getName());
        assertEquals("This is a test community", responseDto.getDescription());
    }

    @Test
    void getCommunityById_NotFound_ThrowsEntityNotFoundException() {
        // Given
        when(communityRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
            communityService.getCommunityById(1L)
        );

        assertEquals("Comunidad no encontrada", exception.getMessage());
        verify(communityRepository).findById(1L);
    }

    @Test
    void joinCommunity_Success() {
        // Given
        User newUser = new User();
        newUser.setId(2L);
        newUser.setFirstName("jane");
        newUser.setCommunities(new HashSet<>());

        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));
        when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
        when(communityRepository.save(any(Community.class))).thenReturn(testCommunity);

        // When
        CommunityResponseDto responseDto = communityService.joinCommunity(1L, 2L);

        // Then
        verify(communityRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(communityRepository).save(testCommunity);
        verify(userRepository).save(newUser);

        // Verify user was added to community
        ArgumentCaptor<Community> communityCaptor = ArgumentCaptor.forClass(Community.class);
        verify(communityRepository).save(communityCaptor.capture());
        Community savedCommunity = communityCaptor.getValue();
        assertTrue(savedCommunity.getMembers().stream()
                .anyMatch(member -> member.getId().equals(2L)));
    }

    @Test
    void joinCommunity_AlreadyMember_ThrowsIllegalStateException() {
        // Given
        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
            communityService.joinCommunity(1L, 1L)
        );

        assertEquals("El usuario ya es miembro de esta comunidad", exception.getMessage());
        verify(communityRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(communityRepository, never()).save(any(Community.class));
    }

    @Test
    void leaveCommunity_Success() {
        // Given
        User memberUser = new User();
        memberUser.setId(2L);
        memberUser.setFirstName("jane");
        memberUser.setCommunities(new HashSet<>(Collections.singleton(testCommunity)));

        testCommunity.getMembers().add(memberUser);

        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));
        when(userRepository.findById(2L)).thenReturn(Optional.of(memberUser));
        when(communityRepository.save(any(Community.class))).thenReturn(testCommunity);

        // When
        CommunityResponseDto responseDto = communityService.leaveCommunity(1L, 2L);

        // Then
        verify(communityRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(communityRepository).save(testCommunity);
        verify(userRepository).save(memberUser);

        // Verify user was removed from community
        ArgumentCaptor<Community> communityCaptor = ArgumentCaptor.forClass(Community.class);
        verify(communityRepository).save(communityCaptor.capture());
        Community savedCommunity = communityCaptor.getValue();
        assertFalse(savedCommunity.getMembers().stream()
                .anyMatch(member -> member.getId().equals(2L)));
    }

    @Test
    void leaveCommunity_CreatorCantLeave_ThrowsIllegalStateException() {
        // Given
        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
            communityService.leaveCommunity(1L, 1L)
        );

        assertEquals("El creador no puede abandonar la comunidad", exception.getMessage());
        verify(communityRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(communityRepository, never()).save(any(Community.class));
    }

    @Test
    void leaveCommunity_NotMember_ThrowsIllegalStateException() {
        // Given
        User nonMemberUser = new User();
        nonMemberUser.setId(3L);
        nonMemberUser.setFirstName("alice");

        when(communityRepository.findById(anyLong())).thenReturn(Optional.of(testCommunity));
        when(userRepository.findById(3L)).thenReturn(Optional.of(nonMemberUser));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
            communityService.leaveCommunity(1L, 3L)
        );

        assertEquals("El usuario no es miembro de esta comunidad", exception.getMessage());
        verify(communityRepository).findById(1L);
        verify(userRepository).findById(3L);
        verify(communityRepository, never()).save(any(Community.class));
    }

    @Test
    void getUserCommunities_Success() {
        // Given
        List<Community> communities = List.of(testCommunity);
        when(communityRepository.findAllByMemberId(anyLong())).thenReturn(communities);

        // When
        List<CommunityResponseDto> responseDtos = communityService.getUserCommunities(1L);

        // Then
        verify(communityRepository).findAllByMemberId(1L);
        assertNotNull(responseDtos);
        assertEquals(1, responseDtos.size());

        CommunityResponseDto responseDto = responseDtos.get(0);
        assertEquals(1L, responseDto.getId());
        assertEquals("Test Community", responseDto.getName());
        assertEquals("This is a test community", responseDto.getDescription());
    }
}
