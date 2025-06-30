package com.greenloop.greenloop.community.domain;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.community.dto.MembershipRequestActionDto;
import com.greenloop.greenloop.community.dto.MembershipRequestDto;
import com.greenloop.greenloop.community.dto.MembershipRequestResponseDto;
import com.greenloop.greenloop.community.exceptions.CommunityAuthorizationException;
import com.greenloop.greenloop.community.exceptions.CommunityMembershipException;
import com.greenloop.greenloop.community.exceptions.CommunityNotFoundException;
import com.greenloop.greenloop.community.infrastructure.CommunityMembershipRequestRepository;
import com.greenloop.greenloop.community.infrastructure.CommunityRepository;
import com.greenloop.greenloop.notification.domain.NotificationEvent;
import com.greenloop.greenloop.notification.domain.NotificationType;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CommunityMembershipRequestService {

        @Autowired
        private CommunityMembershipRequestRepository requestRepository;

        @Autowired
        private CommunityRepository communityRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CommunityService communityService;

        @Autowired
        private ApplicationEventPublisher eventPublisher;

        /**
         * Crear una solicitud de membresía
         */
        @Transactional
        public MembershipRequestResponseDto createMembershipRequest(Long communityId, Long userId,
                        MembershipRequestDto requestDto) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // Verificar que la comunidad sea privada
                if (community.getType() == CommunityType.PUBLIC) {
                        throw new CommunityMembershipException(
                                        "Esta es una comunidad pública. Puedes unirte directamente sin solicitud.");
                }

                // Verificar que el usuario no sea ya miembro
                if (community.getMembers().contains(user)) {
                        throw new CommunityMembershipException("Ya eres miembro de esta comunidad");
                }

                // Verificar que no exista una solicitud pendiente
                if (requestRepository.existsByCommunityAndUserAndStatus(community, user,
                                CommunityMembershipRequest.RequestStatus.PENDING)) {
                        throw new CommunityMembershipException("Ya tienes una solicitud pendiente para esta comunidad");
                }

                // Crear la solicitud
                CommunityMembershipRequest membershipRequest = CommunityMembershipRequest.builder()
                                .community(community)
                                .user(user)
                                .message(requestDto.getMessage())
                                .status(CommunityMembershipRequest.RequestStatus.PENDING)
                                .build();

                CommunityMembershipRequest savedRequest = requestRepository.save(membershipRequest);

                // Enviar notificación al creador de la comunidad
                String notificationTitle = "Nueva solicitud de membresía";
                String notificationMessage = user.getFirstName() + " " + user.getLastName() +
                                " quiere unirse a tu comunidad '" + community.getName() + "'";

                if (requestDto.getMessage() != null && !requestDto.getMessage().trim().isEmpty()) {
                        notificationMessage += ". Mensaje: " + requestDto.getMessage();
                }

                eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                community.getCreator().getId(),
                                notificationTitle,
                                notificationMessage,
                                NotificationType.COMMUNITY_REQUEST,
                                savedRequest.getId(),
                                "/api/communities/membership-requests/" + savedRequest.getId(),
                                false));

                return mapToDto(savedRequest);
        }

        /**
         * Responder a una solicitud de membresía (aprobar o rechazar)
         */
        @Transactional
        public MembershipRequestResponseDto respondToMembershipRequest(Long requestId, Long creatorId,
                        MembershipRequestActionDto actionDto) {
                CommunityMembershipRequest membershipRequest = requestRepository.findById(requestId)
                                .orElseThrow(() -> new EntityNotFoundException("Solicitud de membresía no encontrada"));

                // Verificar que el usuario sea el creador de la comunidad
                if (!membershipRequest.getCommunity().getCreator().getId().equals(creatorId)) {
                        throw new CommunityAuthorizationException(
                                        "Solo el creador de la comunidad puede responder a solicitudes");
                }

                // Verificar que la solicitud esté pendiente
                if (membershipRequest.getStatus() != CommunityMembershipRequest.RequestStatus.PENDING) {
                        throw new CommunityMembershipException("Esta solicitud ya ha sido respondida");
                }

                // Actualizar la solicitud
                membershipRequest.setStatus(actionDto.getApproved() ? CommunityMembershipRequest.RequestStatus.APPROVED
                                : CommunityMembershipRequest.RequestStatus.REJECTED);
                membershipRequest.setRespondedAt(LocalDateTime.now());
                membershipRequest.setResponseMessage(actionDto.getResponseMessage());

                CommunityMembershipRequest updatedRequest = requestRepository.save(membershipRequest);

                // Si fue aprobada, agregar al usuario a la comunidad
                if (actionDto.getApproved()) {
                        try {
                                // Agregar directamente al usuario a la comunidad (bypass de validaciones de
                                // privacidad)
                                Community community = membershipRequest.getCommunity();
                                User user = membershipRequest.getUser();

                                // Verificar si el usuario ya es miembro
                                if (!community.getMembers().contains(user)) {
                                        community.getMembers().add(user);
                                        communityRepository.save(community);
                                }
                        } catch (Exception e) {
                                // Si falla la unión, revertir el estado de la solicitud
                                membershipRequest.setStatus(CommunityMembershipRequest.RequestStatus.PENDING);
                                membershipRequest.setRespondedAt(null);
                                membershipRequest.setResponseMessage(null);
                                requestRepository.save(membershipRequest);
                                throw new CommunityMembershipException(
                                                "Error al agregar el usuario a la comunidad: " + e.getMessage());
                        }
                }

                // Enviar notificación al solicitante
                String notificationTitle = actionDto.getApproved() ? "Solicitud de membresía aprobada"
                                : "Solicitud de membresía rechazada";

                String notificationMessage = actionDto.getApproved()
                                ? "Tu solicitud para unirte a la comunidad '"
                                                + membershipRequest.getCommunity().getName()
                                                + "' ha sido aprobada."
                                : "Tu solicitud para unirte a la comunidad '"
                                                + membershipRequest.getCommunity().getName()
                                                + "' ha sido rechazada.";

                if (actionDto.getResponseMessage() != null && !actionDto.getResponseMessage().trim().isEmpty()) {
                        notificationMessage += " Mensaje del creador: " + actionDto.getResponseMessage();
                }

                eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                membershipRequest.getUser().getId(),
                                notificationTitle,
                                notificationMessage,
                                NotificationType.COMMUNITY,
                                membershipRequest.getCommunity().getId(),
                                "/communities/" + membershipRequest.getCommunity().getId(),
                                false));

                return mapToDto(updatedRequest);
        }

        /**
         * Obtener solicitudes pendientes para un creador de comunidades
         */
        @Transactional(readOnly = true)
        public List<MembershipRequestResponseDto> getPendingRequestsForCreator(Long creatorId) {
                User creator = userRepository.findById(creatorId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<CommunityMembershipRequest> requests = requestRepository.findPendingRequestsForCreator(
                                creator, CommunityMembershipRequest.RequestStatus.PENDING);

                return requests.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        /**
         * Obtener solicitudes de un usuario
         */
        @Transactional(readOnly = true)
        public List<MembershipRequestResponseDto> getUserRequests(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<CommunityMembershipRequest> requests = requestRepository.findByUserOrderByCreatedAtDesc(user);

                return requests.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        /**
         * Obtener solicitudes pendientes de una comunidad específica
         */
        @Transactional(readOnly = true)
        public List<MembershipRequestResponseDto> getCommunityPendingRequests(Long communityId, Long creatorId) {
                Community community = communityRepository.findById(communityId)
                                .orElseThrow(() -> new CommunityNotFoundException(
                                                "Comunidad no encontrada con ID: " + communityId));

                // Verificar que el usuario sea el creador
                if (!community.getCreator().getId().equals(creatorId)) {
                        throw new CommunityAuthorizationException(
                                        "Solo el creador puede ver las solicitudes de la comunidad");
                }

                List<CommunityMembershipRequest> requests = requestRepository
                                .findByCommunityAndStatusOrderByCreatedAtDesc(
                                                community, CommunityMembershipRequest.RequestStatus.PENDING);

                return requests.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        /**
         * Contar solicitudes pendientes para un creador
         */
        @Transactional(readOnly = true)
        public long countPendingRequestsForCreator(Long creatorId) {
                User creator = userRepository.findById(creatorId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                return requestRepository.countPendingRequestsForCreator(creator,
                                CommunityMembershipRequest.RequestStatus.PENDING);
        }

        /**
         * Obtener una solicitud específica
         */
        @Transactional(readOnly = true)
        public MembershipRequestResponseDto getMembershipRequest(Long requestId, Long userId) {
                CommunityMembershipRequest request = requestRepository.findById(requestId)
                                .orElseThrow(() -> new EntityNotFoundException("Solicitud de membresía no encontrada"));

                // Verificar que el usuario sea el solicitante o el creador de la comunidad
                if (!request.getUser().getId().equals(userId) &&
                                !request.getCommunity().getCreator().getId().equals(userId)) {
                        throw new CommunityAuthorizationException("No tienes permisos para ver esta solicitud");
                }

                return mapToDto(request);
        }

        /**
         * Mapear entidad a DTO
         */
        private MembershipRequestResponseDto mapToDto(CommunityMembershipRequest request) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                return MembershipRequestResponseDto.builder()
                                .id(request.getId())
                                .communityId(request.getCommunity().getId())
                                .communityName(request.getCommunity().getName())
                                .userId(request.getUser().getId())
                                .userName(request.getUser().getUsername())
                                .userFirstName(request.getUser().getFirstName())
                                .userLastName(request.getUser().getLastName())
                                .message(request.getMessage())
                                .status(request.getStatus())
                                .createdAt(request.getCreatedAt().format(formatter))
                                .respondedAt(request.getRespondedAt() != null
                                                ? request.getRespondedAt().format(formatter)
                                                : null)
                                .responseMessage(request.getResponseMessage())
                                .build();
        }
}
