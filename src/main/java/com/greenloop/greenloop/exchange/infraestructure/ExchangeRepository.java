package com.greenloop.greenloop.exchange.infraestructure;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.exchange.domain.Exchange;
import com.greenloop.greenloop.exchange.domain.ExchangeStatus;
import com.greenloop.greenloop.product.domain.Product;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, Long> {
    List<Exchange> findByRequester(User requester);

    List<Exchange> findByProvider(User provider);

    List<Exchange> findByRequesterAndStatus(User requester, ExchangeStatus status);

    List<Exchange> findByProviderAndStatus(User provider, ExchangeStatus status);

    List<Exchange> findByRequestedProduct(Product product);

    List<Exchange> findByOfferedProduct(Product product);

    // Nuevos métodos para el dashboard
    @Query("SELECT COUNT(e) FROM Exchange e WHERE e.requestedAt BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Exchange e ORDER BY e.requestedAt DESC")
    List<Exchange> findRecentExchanges(Pageable pageable);
}
