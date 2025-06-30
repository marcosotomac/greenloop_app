package com.greenloop.greenloop.community.domain;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.community.dto.CommunityRequestDto;
import com.greenloop.greenloop.community.dto.CommunityResponseDto;
import com.greenloop.greenloop.community.dto.CommunitySearchDto;
import com.greenloop.greenloop.community.dto.CommunitySummaryDto;
import com.greenloop.greenloop.community.dto.CommunityUpdateDto;
import com.greenloop.greenloop.community.dto.UserDto;
import com.greenloop.greenloop.community.exceptions.CommunityAuthorizationException;
import com.greenloop.greenloop.community.exceptions.CommunityMembershipException;
import com.greenloop.greenloop.community.exceptions.CommunityNotFoundException;
import com.greenloop.greenloop.community.infrastructure.CommunityRepository;
import com.greenloop.greenloop.notification.domain.NotificationService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CommunityService {

        @Autowired
        private CommunityRepository communityRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private NotificationService notificationService;

        @Transactional
        public CommunityResponseDto createCommunity(CommunityRequestDto requestDto, Long creatorId) {
                // Verificar si ya existe una comunidad con ese nombre
                if (communityRepository.existsByName(requestDto.getName())) {
                        throw new IllegalArgumentException("Ya existe una comunidad con ese nombre");
                }

                // Obtener el usuario creador
                User creator = userRepository.findById(creatorId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // Crear la comunidad
                Community community = Community.builder()
                                .name(requestDto.getName())
                                .description(requestDto.getDescription())
                                .type(requestDto.getType() != null ? requestDto.getType() : CommunityType.PUBLIC)
                                .creator(creator)
                                .build();

                // Añadir al creador como miembro
                community.addMember(creator);

                // Guardar la comunidad
                Community savedCommunity = communityRepository.save(community);

                // Actualizar las comunidades del usuario
                creator.addCommunity(savedCommunity);
                userRepository.save(creator);

                // Notificar que se ha creado una nueva comunidad
                try {
                        notificationService.notifyCommunityCreated(
                                        creatorId,
                                        savedCommunity.getId(),
                                        savedCommunity.getName());
                } catch (Exception e) {
                        System.err.println("Error al enviar notificación de comunidad creada: " + e.getMessage());
                }

                return mapToDto(savedCommunity);
        }

        @Transactional(readOnly = true)
        public List<CommunityResponseDto> getAllCommunities() {
                return communityRepository.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public CommunityResponseDto getCommunityById(Long id) {
                Community community = communityRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Comunidad no encontrada"));
                return mapToDto(community);
        }

        @Transactional
        public CommunityResponseDto joinCommunity(Long communityId, Long userId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new EntityNotFoundException("Comunidad no encontrada"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // Verificar si el usuario ya es miembro
                if (community.getMembers().contains(user)) {
                        throw new IllegalStateException("El usuario ya es miembro de esta comunidad");
                }

                // Verificar el tipo de comunidad
                if (community.getType() == CommunityType.PRIVATE) {
                        throw new CommunityMembershipException(
                                        "Esta es una comunidad privada. Debes solicitar membresía primero.");
                }

                // Añadir al usuario como miembro (solo para comunidades públicas)
                community.addMember(user);
                user.addCommunity(community);

                communityRepository.save(community);
                userRepository.save(user);

                return mapToDto(community);
        }

        @Transactional
        public CommunityResponseDto leaveCommunity(Long communityId, Long userId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new EntityNotFoundException("Comunidad no encontrada"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // Verificar si el usuario es el creador
                if (community.getCreator().equals(user)) {
                        throw new IllegalStateException("El creador no puede abandonar la comunidad");
                }

                // Verificar si el usuario es miembro
                if (!community.getMembers().contains(user)) {
                        throw new IllegalStateException("El usuario no es miembro de esta comunidad");
                }

                // Remover al usuario de la comunidad
                community.removeMember(user);
                user.removeCommunity(community);

                communityRepository.save(community);
                userRepository.save(user);

                return mapToDto(community);
        }

        @Transactional(readOnly = true)
        public List<CommunityResponseDto> getUserCommunities(Long userId) {
                return communityRepository.findAllByMemberId(userId).stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        // ================================
        // NUEVOS MÉTODOS IMPLEMENTADOS
        // ================================

        @Transactional(readOnly = true)
        public Page<CommunityResponseDto> getPaginatedCommunities(int page, int size, String sortBy) {
                Sort sort = Sort.by(Sort.Direction.DESC, sortBy);
                Pageable pageable = PageRequest.of(page, size, sort);
                Page<Community> communityPage = communityRepository.findAll(pageable);

                return communityPage.map(this::mapToDto);
        }

        @Transactional(readOnly = true)
        public List<CommunityResponseDto> searchCommunities(CommunitySearchDto searchDto) {
                List<Community> communities = communityRepository.searchCommunities(
                                searchDto.getName(),
                                searchDto.getLocation(),
                                searchDto.getMinMembers(),
                                searchDto.getMaxMembers(),
                                searchDto.getCreatorName());

                return communities.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public CommunityResponseDto updateCommunity(Long communityId, CommunityUpdateDto updateDto, Long userId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                // Verificar que el usuario sea el creador
                if (!community.getCreator().getId().equals(userId)) {
                        throw new CommunityAuthorizationException("Solo el creador puede actualizar la comunidad");
                }

                // Actualizar campos
                if (updateDto.getDescription() != null) {
                        community.setDescription(updateDto.getDescription());
                }
                if (updateDto.getLocation() != null) {
                        community.setLocation(updateDto.getLocation());
                }

                Community updatedCommunity = communityRepository.save(community);
                return mapToDto(updatedCommunity);
        }

        @Transactional(readOnly = true)
        public List<UserDto> getCommunityMembers(Long communityId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                return community.getMembers().stream()
                                .map(user -> UserDto.builder()
                                                .id(user.getId())
                                                .username(user.getUsername())
                                                .email(user.getEmail())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public boolean isMember(Long communityId, Long userId) {
                return communityRepository.existsByIdAndMembersId(communityId, userId);
        }

        @Transactional(readOnly = true)
        public Map<String, Object> getCommunityStats(Long communityId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                Map<String, Object> stats = new HashMap<>();
                stats.put("totalMembers", community.getMembers().size());
                stats.put("createdAt",
                                community.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                stats.put("creatorName",
                                community.getCreator().getFirstName() + " " + community.getCreator().getLastName());
                stats.put("location", community.getLocation());

                // Estadísticas adicionales
                long activeMembers = community.getMembers().stream()
                                .filter(user -> user.getRole() != null)
                                .count();
                stats.put("activeMembers", activeMembers);

                return stats;
        }

        @Transactional(readOnly = true)
        public List<CommunitySummaryDto> getPopularCommunities(int limit) {
                Pageable pageable = PageRequest.of(0, limit);
                List<Community> communities = communityRepository.findTopByOrderByMemberCountDesc(pageable);

                return communities.stream()
                                .map(this::mapToSummaryDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<CommunitySummaryDto> getRecentCommunities(int limit) {
                Pageable pageable = PageRequest.of(0, limit);
                List<Community> communities = communityRepository.findTopByOrderByCreatedAtDesc(pageable);

                return communities.stream()
                                .map(this::mapToSummaryDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deleteCommunity(Long communityId, Long userId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                // Verificar que el usuario sea el creador
                if (!community.getCreator().getId().equals(userId)) {
                        throw new CommunityAuthorizationException("Solo el creador puede eliminar la comunidad");
                }

                // Verificar que no tenga miembros (excepto el creador)
                if (community.getMembers().size() > 1) {
                        throw new CommunityMembershipException("No se puede eliminar una comunidad que tiene miembros");
                }

                // Remover la comunidad de los usuarios
                for (User member : community.getMembers()) {
                        member.removeCommunity(community);
                        userRepository.save(member);
                }

                communityRepository.delete(community);
        }

        // ================================
        // MÉTODOS PARA TIPOS DE COMUNIDADES
        // ================================

        @Transactional(readOnly = true)
        public List<CommunityResponseDto> getCommunitiesByType(CommunityType type) {
                List<Community> communities = communityRepository.findByTypeOrderByCreatedAtDesc(type);
                return communities.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public Map<String, Object> getCommunityTypeStats() {
                long publicCount = communityRepository.countByType(CommunityType.PUBLIC);
                long privateCount = communityRepository.countByType(CommunityType.PRIVATE);
                long totalCount = publicCount + privateCount;

                Map<String, Object> stats = new HashMap<>();
                stats.put("publicCommunities", publicCount);
                stats.put("privateCommunities", privateCount);
                stats.put("totalCommunities", totalCount);

                // Calcular porcentajes
                if (totalCount > 0) {
                        double publicPercentage = (double) publicCount / totalCount * 100;
                        double privatePercentage = (double) privateCount / totalCount * 100;
                        stats.put("publicPercentage", Math.round(publicPercentage * 100.0) / 100.0);
                        stats.put("privatePercentage", Math.round(privatePercentage * 100.0) / 100.0);
                } else {
                        stats.put("publicPercentage", 0.0);
                        stats.put("privatePercentage", 0.0);
                }

                return stats;
        }

        // ================================
        // MÉTODOS DE MAPEO
        // ================================

        private CommunitySummaryDto mapToSummaryDto(Community community) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                UserDto creatorDto = UserDto.builder()
                                .id(community.getCreator().getId())
                                .username(community.getCreator().getUsername())
                                .build();

                return CommunitySummaryDto.builder()
                                .id(community.getId())
                                .name(community.getName())
                                .description(community.getDescription())
                                .memberCount(community.getMembers().size())
                                .createdAt(community.getCreatedAt().format(formatter))
                                .creator(creatorDto)
                                .type(community.getType())
                                .build();
        }

        private CommunityResponseDto mapToDto(Community community) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                Set<UserDto> memberDtos = community.getMembers().stream()
                                .map(user -> UserDto.builder()
                                                .id(user.getId())
                                                .username(user.getUsername())
                                                .email(user.getEmail())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .build())
                                .collect(Collectors.toSet());

                UserDto creatorDto = UserDto.builder()
                                .id(community.getCreator().getId())
                                .username(community.getCreator().getUsername())
                                .email(community.getCreator().getEmail())
                                .firstName(community.getCreator().getFirstName())
                                .lastName(community.getCreator().getLastName())
                                .build();

                return CommunityResponseDto.builder()
                                .id(community.getId())
                                .name(community.getName())
                                .description(community.getDescription())
                                .location(community.getLocation())
                                .type(community.getType())
                                .creator(creatorDto)
                                .members(memberDtos)
                                .createdAt(community.getCreatedAt().format(formatter))
                                .memberCount(community.getMembers().size())
                                .build();
        }
}