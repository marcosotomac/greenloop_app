package com.greenloop.greenloop.community.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.community.domain.Community;
import com.greenloop.greenloop.community.domain.CommunityMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMembershipRequestRepository extends JpaRepository<CommunityMembershipRequest, Long> {

    // Buscar solicitud específica de un usuario para una comunidad
    Optional<CommunityMembershipRequest> findByCommunityAndUser(Community community, User user);

    // Verificar si existe una solicitud pendiente
    boolean existsByCommunityAndUserAndStatus(Community community, User user,
            CommunityMembershipRequest.RequestStatus status);

    // Obtener todas las solicitudes de una comunidad por estado
    List<CommunityMembershipRequest> findByCommunityAndStatusOrderByCreatedAtDesc(Community community,
            CommunityMembershipRequest.RequestStatus status);

    // Obtener todas las solicitudes de un usuario
    List<CommunityMembershipRequest> findByUserOrderByCreatedAtDesc(User user);

    // Obtener solicitudes pendientes de un usuario
    List<CommunityMembershipRequest> findByUserAndStatusOrderByCreatedAtDesc(User user,
            CommunityMembershipRequest.RequestStatus status);

    // Obtener solicitudes pendientes para comunidades donde el usuario es creador
    @Query("SELECT cmr FROM CommunityMembershipRequest cmr WHERE cmr.community.creator = :creator AND cmr.status = :status ORDER BY cmr.createdAt DESC")
    List<CommunityMembershipRequest> findPendingRequestsForCreator(@Param("creator") User creator,
            @Param("status") CommunityMembershipRequest.RequestStatus status);

    // Contar solicitudes pendientes para un creador
    @Query("SELECT COUNT(cmr) FROM CommunityMembershipRequest cmr WHERE cmr.community.creator = :creator AND cmr.status = :status")
    long countPendingRequestsForCreator(@Param("creator") User creator,
            @Param("status") CommunityMembershipRequest.RequestStatus status);
}
