package com.greenloop.greenloop.product.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductStatus;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
        List<Product> findByProductNameContainingIgnoreCase(String name);

        // Nuevos métodos para la funcionalidad de intercambio
        List<Product> findByAvailableForExchangeAndStatus(boolean availableForExchange, ProductStatus status);

        List<Product> findByUserAndAvailableForExchangeAndStatus(User user, boolean availableForExchange,
                        ProductStatus status);

        List<Product> findByAvailableForExchangeAndStatusAndCategoryAndEstimatedValueBetween(
                        boolean availableForExchange, ProductStatus status, Category category, Double minValue,
                        Double maxValue);

        List<Product> findByCategoryInAndStatusAndUserNot(List<Category> desiredCategories, ProductStatus productStatus,
                        User user);

        // Métodos para DTO responses
        List<Product> findByAvailableForExchangeTrue();

        List<Product> findByUserIdAndAvailableForExchangeTrue(Long userId);

        // Método para obtener todos los productos de un usuario
        List<Product> findByUser(User user);

        // Métodos para filtrar productos por estado
        List<Product> findByStatus(ProductStatus status);

        List<Product> findByStatusNot(ProductStatus status);

        List<Product> findByStatusIn(List<ProductStatus> statuses);

        // Método para obtener productos activos (excluir intercambiados, donados,
        // inactivos)
        List<Product> findByStatusNotIn(List<ProductStatus> excludedStatuses);
}
