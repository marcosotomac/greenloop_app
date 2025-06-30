package com.greenloop.greenloop.community.application;

import com.greenloop.greenloop.community.domain.CommunityMembershipRequestService;
import com.greenloop.greenloop.community.domain.CommunityService;
import com.greenloop.greenloop.community.domain.CommunityType;
import com.greenloop.greenloop.community.dto.*;
import com.greenloop.greenloop.jwt.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
@Tag(name = "Comunidades", description = "API para gestión de comunidades")
@CrossOrigin(origins = "*")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private CommunityMembershipRequestService membershipRequestService;

    @Autowired
    private JwtService jwtService;

    // ================================
    // CREAR COMUNIDAD
    // ================================
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Crear una nueva comunidad", description = "Permite a un usuario autenticado crear una nueva comunidad")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Comunidad creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "409", description = "Ya existe una comunidad con ese nombre"),
            @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
    })
    public ResponseEntity<CommunityResponseDto> createCommunity(
            @Valid @RequestBody CommunityRequestDto requestDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        CommunityResponseDto responseDto = communityService.createCommunity(requestDto, userId);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // ================================
    // OBTENER TODAS LAS COMUNIDADES
    // ================================
    @GetMapping
    @Operation(summary = "Obtener todas las comunidades", description = "Obtiene una lista de todas las comunidades disponibles")
    public ResponseEntity<List<CommunityResponseDto>> getAllCommunities() {
        List<CommunityResponseDto> communities = communityService.getAllCommunities();
        return ResponseEntity.ok(communities);
    }

    // ================================
    // OBTENER COMUNIDADES PAGINADAS
    // ================================
    @GetMapping("/paginated")
    @Operation(summary = "Obtener comunidades paginadas", description = "Obtiene comunidades de forma paginada")
    public ResponseEntity<Page<CommunityResponseDto>> getPaginatedCommunities(
            @Parameter(description = "Número de página (empezando en 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar") @RequestParam(defaultValue = "createdAt") String sortBy) {
        Page<CommunityResponseDto> communities = communityService.getPaginatedCommunities(page, size, sortBy);
        return ResponseEntity.ok(communities);
    }

    // ================================
    // BUSCAR COMUNIDADES
    // ================================
    @GetMapping("/search")
    @Operation(summary = "Buscar comunidades", description = "Busca comunidades por nombre, ubicación o criterios específicos")
    public ResponseEntity<List<CommunityResponseDto>> searchCommunities(
            @Parameter(description = "Nombre de la comunidad") @RequestParam(required = false) String name,
            @Parameter(description = "Ubicación") @RequestParam(required = false) String location,
            @Parameter(description = "Número mínimo de miembros") @RequestParam(required = false) Integer minMembers,
            @Parameter(description = "Número máximo de miembros") @RequestParam(required = false) Integer maxMembers) {

        CommunitySearchDto searchDto = CommunitySearchDto.builder()
                .name(name)
                .location(location)
                .minMembers(minMembers)
                .maxMembers(maxMembers)
                .build();

        List<CommunityResponseDto> communities = communityService.searchCommunities(searchDto);
        return ResponseEntity.ok(communities);
    }

    // ================================
    // OBTENER COMUNIDAD POR ID
    // ================================
    @GetMapping("/{id}")
    @Operation(summary = "Obtener comunidad por ID", description = "Obtiene los detalles de una comunidad específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comunidad encontrada"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<CommunityResponseDto> getCommunityById(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id) {
        CommunityResponseDto community = communityService.getCommunityById(id);
        return ResponseEntity.ok(community);
    }

    // ================================
    // ACTUALIZAR COMUNIDAD
    // ================================
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Actualizar comunidad", description = "Permite al creador actualizar los datos de su comunidad")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comunidad actualizada exitosamente"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para actualizar esta comunidad"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<CommunityResponseDto> updateCommunity(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            @Valid @RequestBody CommunityUpdateDto updateDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        CommunityResponseDto responseDto = communityService.updateCommunity(id, updateDto, userId);
        return ResponseEntity.ok(responseDto);
    }

    // ================================
    // UNIRSE A COMUNIDAD
    // ================================
    @PostMapping("/{id}/join")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unirse a una comunidad", description = "Permite a un usuario unirse a una comunidad existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario unido a la comunidad exitosamente"),
            @ApiResponse(responseCode = "400", description = "El usuario ya es miembro de la comunidad"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<CommunityResponseDto> joinCommunity(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        CommunityResponseDto responseDto = communityService.joinCommunity(id, userId);
        return ResponseEntity.ok(responseDto);
    }

    // ================================
    // ABANDONAR COMUNIDAD
    // ================================
    @PostMapping("/{id}/leave")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Abandonar una comunidad", description = "Permite a un usuario abandonar una comunidad (excepto el creador)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario ha abandonado la comunidad exitosamente"),
            @ApiResponse(responseCode = "400", description = "El usuario no es miembro de la comunidad"),
            @ApiResponse(responseCode = "409", description = "El creador no puede abandonar la comunidad"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<CommunityResponseDto> leaveCommunity(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        CommunityResponseDto responseDto = communityService.leaveCommunity(id, userId);
        return ResponseEntity.ok(responseDto);
    }

    // ================================
    // OBTENER COMUNIDADES DEL USUARIO
    // ================================
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener comunidades del usuario", description = "Obtiene todas las comunidades donde el usuario autenticado es miembro")
    public ResponseEntity<List<CommunityResponseDto>> getUserCommunities(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<CommunityResponseDto> communities = communityService.getUserCommunities(userId);
        return ResponseEntity.ok(communities);
    }

    // ================================
    // OBTENER MIEMBROS DE UNA COMUNIDAD
    // ================================
    @GetMapping("/{id}/members")
    @Operation(summary = "Obtener miembros de una comunidad", description = "Obtiene la lista de miembros de una comunidad específica")
    public ResponseEntity<List<UserDto>> getCommunityMembers(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id) {
        List<UserDto> members = communityService.getCommunityMembers(id);
        return ResponseEntity.ok(members);
    }

    // ================================
    // VERIFICAR MEMBRESÍA
    // ================================
    @GetMapping("/{id}/membership/check")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verificar membresía", description = "Verifica si el usuario autenticado es miembro de la comunidad")
    public ResponseEntity<Boolean> checkMembership(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        boolean isMember = communityService.isMember(id, userId);
        return ResponseEntity.ok(isMember);
    }

    // ================================
    // ESTADÍSTICAS DE COMUNIDAD
    // ================================
    @GetMapping("/{id}/stats")
    @Operation(summary = "Obtener estadísticas de la comunidad", description = "Obtiene estadísticas detalladas de una comunidad")
    public ResponseEntity<Map<String, Object>> getCommunityStats(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id) {
        Map<String, Object> stats = communityService.getCommunityStats(id);
        return ResponseEntity.ok(stats);
    }

    // ================================
    // COMUNIDADES POPULARES
    // ================================
    @GetMapping("/popular")
    @Operation(summary = "Obtener comunidades populares", description = "Obtiene las comunidades con más miembros")
    public ResponseEntity<List<CommunitySummaryDto>> getPopularCommunities(
            @Parameter(description = "Número máximo de comunidades a retornar") @RequestParam(defaultValue = "10") int limit) {
        List<CommunitySummaryDto> popularCommunities = communityService.getPopularCommunities(limit);
        return ResponseEntity.ok(popularCommunities);
    }

    // ================================
    // COMUNIDADES RECIENTES
    // ================================
    @GetMapping("/recent")
    @Operation(summary = "Obtener comunidades recientes", description = "Obtiene las comunidades creadas más recientemente")
    public ResponseEntity<List<CommunitySummaryDto>> getRecentCommunities(
            @Parameter(description = "Número máximo de comunidades a retornar") @RequestParam(defaultValue = "10") int limit) {
        List<CommunitySummaryDto> recentCommunities = communityService.getRecentCommunities(limit);
        return ResponseEntity.ok(recentCommunities);
    }

    // ================================
    // ELIMINAR COMUNIDAD (Solo creador)
    // ================================
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Eliminar comunidad", description = "Permite al creador eliminar su comunidad")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Comunidad eliminada exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el creador puede eliminar la comunidad"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<Void> deleteCommunity(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        communityService.deleteCommunity(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ================================
    // SOLICITUDES DE MEMBRESÍA
    // ================================

    @PostMapping("/{id}/request-membership")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Solicitar membresía a una comunidad", description = "Permite a un usuario solicitar unirse a una comunidad")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Solicitud enviada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Ya eres miembro o ya tienes una solicitud pendiente"),
            @ApiResponse(responseCode = "404", description = "Comunidad no encontrada")
    })
    public ResponseEntity<MembershipRequestResponseDto> requestMembership(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            @Valid @RequestBody MembershipRequestDto requestDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        MembershipRequestResponseDto response = membershipRequestService.createMembershipRequest(id, userId,
                requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/membership-requests/pending")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener solicitudes pendientes", description = "Obtiene todas las solicitudes de membresía pendientes para las comunidades del usuario")
    public ResponseEntity<List<MembershipRequestResponseDto>> getPendingMembershipRequests(
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<MembershipRequestResponseDto> requests = membershipRequestService.getPendingRequestsForCreator(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/membership-requests/my-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener mis solicitudes", description = "Obtiene todas las solicitudes de membresía del usuario autenticado")
    public ResponseEntity<List<MembershipRequestResponseDto>> getMyMembershipRequests(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<MembershipRequestResponseDto> requests = membershipRequestService.getUserRequests(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}/membership-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener solicitudes de una comunidad", description = "Obtiene las solicitudes pendientes para una comunidad específica (solo creador)")
    public ResponseEntity<List<MembershipRequestResponseDto>> getCommunityMembershipRequests(
            @Parameter(description = "ID de la comunidad") @PathVariable Long id,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        List<MembershipRequestResponseDto> requests = membershipRequestService.getCommunityPendingRequests(id, userId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/membership-requests/{requestId}/respond")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Responder a solicitud de membresía", description = "Permite al creador aprobar o rechazar una solicitud de membresía")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitud respondida exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el creador puede responder solicitudes"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    public ResponseEntity<MembershipRequestResponseDto> respondToMembershipRequest(
            @Parameter(description = "ID de la solicitud") @PathVariable Long requestId,
            @Valid @RequestBody MembershipRequestActionDto actionDto,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        MembershipRequestResponseDto response = membershipRequestService.respondToMembershipRequest(requestId, userId,
                actionDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/membership-requests/{requestId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener solicitud específica", description = "Obtiene los detalles de una solicitud de membresía específica")
    public ResponseEntity<MembershipRequestResponseDto> getMembershipRequest(
            @Parameter(description = "ID de la solicitud") @PathVariable Long requestId,
            Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        MembershipRequestResponseDto request = membershipRequestService.getMembershipRequest(requestId, userId);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/membership-requests/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Contar solicitudes pendientes", description = "Obtiene el número de solicitudes pendientes para las comunidades del usuario")
    public ResponseEntity<Map<String, Object>> countPendingMembershipRequests(Authentication authentication) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        long count = membershipRequestService.countPendingRequestsForCreator(userId);
        Map<String, Object> response = Map.of("pendingRequests", count);
        return ResponseEntity.ok(response);
    }

    // ================================
    // ENDPOINTS PARA TIPOS DE COMUNIDADES
    // ================================

    @GetMapping("/public")
    @Operation(summary = "Obtener comunidades públicas", description = "Obtiene todas las comunidades públicas disponibles")
    public ResponseEntity<List<CommunityResponseDto>> getPublicCommunities() {
        List<CommunityResponseDto> communities = communityService.getCommunitiesByType(CommunityType.PUBLIC);
        return ResponseEntity.ok(communities);
    }

    @GetMapping("/private")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener comunidades privadas", description = "Obtiene todas las comunidades privadas (solo para usuarios autenticados)")
    public ResponseEntity<List<CommunityResponseDto>> getPrivateCommunities() {
        List<CommunityResponseDto> communities = communityService.getCommunitiesByType(CommunityType.PRIVATE);
        return ResponseEntity.ok(communities);
    }

    @GetMapping("/type-stats")
    @Operation(summary = "Obtener estadísticas por tipo", description = "Obtiene estadísticas de comunidades públicas vs privadas")
    public ResponseEntity<Map<String, Object>> getCommunityTypeStats() {
        Map<String, Object> stats = communityService.getCommunityTypeStats();
        return ResponseEntity.ok(stats);
    }
}