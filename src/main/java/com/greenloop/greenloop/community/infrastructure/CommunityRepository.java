package com.greenloop.greenloop.community.infrastructure;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.community.domain.Community;
import com.greenloop.greenloop.community.domain.CommunityType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByName(String name);

    List<Community> findByCreator(User creator);

    @Query("SELECT c FROM Community c JOIN c.members m WHERE m.id = :userId")
    List<Community> findAllByMemberId(Long userId);

    boolean existsByName(String name);

    // Búsqueda con filtros
    @Query("SELECT c FROM Community c WHERE " +
            "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:minMembers IS NULL OR SIZE(c.members) >= :minMembers) AND " +
            "(:maxMembers IS NULL OR SIZE(c.members) <= :maxMembers) AND " +
            "(:creatorName IS NULL OR LOWER(c.creator.firstName) LIKE LOWER(CONCAT('%', :creatorName, '%')) OR " +
            " LOWER(c.creator.lastName) LIKE LOWER(CONCAT('%', :creatorName, '%')))")
    List<Community> searchCommunities(@Param("name") String name,
            @Param("location") String location,
            @Param("minMembers") Integer minMembers,
            @Param("maxMembers") Integer maxMembers,
            @Param("creatorName") String creatorName);

    // Comunidades populares (ordenadas por número de miembros)
    @Query("SELECT c FROM Community c ORDER BY SIZE(c.members) DESC")
    List<Community> findTopByOrderByMemberCountDesc(Pageable pageable);

    // Comunidades recientes (ordenadas por fecha de creación)
    List<Community> findTopByOrderByCreatedAtDesc(Pageable pageable);

    // Verificar si un usuario es miembro de una comunidad
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Community c JOIN c.members m WHERE c.id = :communityId AND m.id = :userId")
    boolean existsByIdAndMembersId(@Param("communityId") Long communityId, @Param("userId") Long userId);

    // Buscar comunidades por tipo
    List<Community> findByType(CommunityType type);

    // Buscar comunidades públicas ordenadas por fecha
    List<Community> findByTypeOrderByCreatedAtDesc(CommunityType type);

    // Contar comunidades por tipo
    long countByType(CommunityType type);
}
