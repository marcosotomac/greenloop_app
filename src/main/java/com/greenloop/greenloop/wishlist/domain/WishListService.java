package com.greenloop.greenloop.wishlist.domain;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import com.greenloop.greenloop.wishlist.dto.AddToWishListRequestDto;
import com.greenloop.greenloop.wishlist.dto.ProductSummaryDto;
import com.greenloop.greenloop.wishlist.dto.WishListRequestDto;
import com.greenloop.greenloop.wishlist.dto.WishListResponseDto;
import com.greenloop.greenloop.wishlist.dto.WishListSummaryDto;
import com.greenloop.greenloop.wishlist.infrastructure.WishListRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class WishListService {

        @Autowired
        private WishListRepository wishListRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private NotificationService notificationService;

        private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        @Transactional
        public WishListResponseDto createWishList(WishListRequestDto requestDto, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = WishList.builder()
                                .name(requestDto.getName())
                                .description(requestDto.getDescription())
                                .user(user)
                                .isPublic(requestDto.isPublic())
                                .build();

                if (requestDto.getDesiredCategories() != null && !requestDto.getDesiredCategories().isEmpty()) {
                        wishList.setDesiredCategories(requestDto.getDesiredCategories());
                }

                WishList savedWishList = wishListRepository.save(wishList);

                return mapToResponseDto(savedWishList);
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<WishListSummaryDto> getUserWishLists(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                return wishListRepository.findByUser(user).stream()
                                .map(this::mapToSummaryDto)
                                .collect(Collectors.toList());
        }

        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public WishListResponseDto getWishListById(Long wishListId, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findById(wishListId)
                                .orElseThrow(() -> new EntityNotFoundException("Lista de deseos no encontrada"));

                // Verificar si la lista es pública o pertenece al usuario
                if (!wishList.isPublic() && !wishList.getUser().getId().equals(userId)) {
                        throw new IllegalAccessError("No tienes acceso a esta lista de deseos");
                }

                return mapToResponseDto(wishList);
        }

        @Transactional
        public WishListResponseDto updateWishList(Long wishListId, WishListRequestDto requestDto, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findByIdAndUser(wishListId, user)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Lista de deseos no encontrada o no tienes permisos"));

                wishList.setName(requestDto.getName());
                wishList.setDescription(requestDto.getDescription());
                wishList.setPublic(requestDto.isPublic());

                if (requestDto.getDesiredCategories() != null) {
                        wishList.setDesiredCategories(requestDto.getDesiredCategories());
                }

                WishList updatedWishList = wishListRepository.save(wishList);

                return mapToResponseDto(updatedWishList);
        }

        @Transactional
        public void deleteWishList(Long wishListId, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findByIdAndUser(wishListId, user)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Lista de deseos no encontrada o no tienes permisos"));

                // Actualizar los productos que están en esta lista de deseos
                for (Product product : wishList.getProducts()) {
                        product.setWishList(null);
                }

                wishListRepository.delete(wishList);
        }

        @Transactional
        public WishListResponseDto addProductToWishList(AddToWishListRequestDto requestDto, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findByIdAndUser(requestDto.getWishListId(), user)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Lista de deseos no encontrada o no tienes permisos"));

                Product product = productRepository.findById(requestDto.getProductId())
                                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

                // Verificar que el producto no sea del usuario (no tendría sentido añadirlo a
                // su lista de deseos)
                if (product.getUser().getId().equals(userId)) {
                        throw new IllegalArgumentException(
                                        "No puedes añadir tus propios productos a tu lista de deseos");
                }

                // Verificar que el producto esté disponible
                if (product.getStatus() != ProductStatus.ACTIVE) {
                        throw new IllegalArgumentException("El producto no está disponible actualmente");
                }

                // Verificar si el producto ya está en otra lista de deseos del usuario
                List<WishList> existingLists = wishListRepository.findByUserAndProduct(user, product.getProductId());
                if (!existingLists.isEmpty() && !existingLists.contains(wishList)) {
                        throw new IllegalArgumentException("Este producto ya está en otra de tus listas de deseos");
                }

                // Añadir el producto a la lista de deseos
                wishList.addProduct(product);
                wishListRepository.save(wishList);

                return mapToResponseDto(wishList);
        }

        @Transactional
        public WishListResponseDto removeProductFromWishList(Long wishListId, Long productId, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findByIdAndUser(wishListId, user)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Lista de deseos no encontrada o no tienes permisos"));

                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

                // Eliminar el producto de la lista de deseos
                if (wishList.getProducts().contains(product)) {
                        wishList.removeProduct(product);
                        wishListRepository.save(wishList);
                } else {
                        throw new IllegalArgumentException("El producto no está en esta lista de deseos");
                }

                return mapToResponseDto(wishList);
        }

        // Método para notificar a usuarios cuando un producto que está en sus listas de
        // deseos tiene cambios
        @Transactional
        public void notifyProductStatusChange(Product product) {
                // Buscar todas las listas de deseos que contienen este producto
                List<WishList> affectedWishLists = wishListRepository.findAll().stream()
                                .filter(wl -> wl.getProducts().contains(product))
                                .toList();

                // Notificar a cada usuario
                for (WishList wishList : affectedWishLists) {
                        User user = wishList.getUser();

                        String message = "";
                        if (product.getStatus() == ProductStatus.EXCHANGED) {
                                message = "Un producto en tu lista de deseos '" + wishList.getName() +
                                                "' ya no está disponible: " + product.getProductName();

                                // Eliminar el producto de la lista de deseos ya que no está disponible
                                wishList.removeProduct(product);
                                wishListRepository.save(wishList);
                        } else if (product.getStatus() == ProductStatus.ACTIVE) {
                                message = "¡Buenas noticias! Un producto en tu lista de deseos '" + wishList.getName() +
                                                "' está disponible: " + product.getProductName();
                        }

                        notificationService.createNotification(user.getId(), "Actualización de lista de deseos",
                                        message);
                }
        }

        // Metodo para buscar productos que coincidan con las categorías deseadas de las
        // listas de deseos
        @org.springframework.transaction.annotation.Transactional(readOnly = true)
        public List<ProductSummaryDto> findMatchingProducts(Long wishListId, Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                WishList wishList = wishListRepository.findByIdAndUser(wishListId, user)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Lista de deseos no encontrada o no tienes permisos"));

                // Obtener productos que coinciden con las categorías deseadas y que no son del
                // usuario
                List<Product> matchingProducts = productRepository.findByCategoryInAndStatusAndUserNot(
                                wishList.getDesiredCategories(),
                                ProductStatus.ACTIVE,
                                user);

                // Filtrar los productos que ya están en la lista de deseos
                List<Product> productsNotInWishList = matchingProducts.stream()
                                .filter(p -> !wishList.getProducts().contains(p))
                                .toList();

                // Mapear a DTOs
                return productsNotInWishList.stream()
                                .map(this::mapToProductSummaryDto)
                                .collect(Collectors.toList());
        }

        private WishListResponseDto mapToResponseDto(WishList wishList) {
                List<ProductSummaryDto> productDtos = wishList.getProducts().stream()
                                .map(this::mapToProductSummaryDto)
                                .collect(Collectors.toList());

                return WishListResponseDto.builder()
                                .id(wishList.getId())
                                .name(wishList.getName())
                                .description(wishList.getDescription())
                                .desiredCategories(wishList.getDesiredCategories())
                                .products(productDtos)
                                .createdAt(wishList.getCreatedAt().format(formatter))
                                .updatedAt(wishList.getUpdatedAt().format(formatter))
                                .isPublic(wishList.isPublic())
                                .productCount(productDtos.size())
                                .build();
        }

        private WishListSummaryDto mapToSummaryDto(WishList wishList) {
                return WishListSummaryDto.builder()
                                .id(wishList.getId())
                                .name(wishList.getName())
                                .description(wishList.getDescription())
                                .productCount(wishList.getProducts().size())
                                .isPublic(wishList.isPublic())
                                .desiredCategories(wishList.getDesiredCategories())
                                .createdAt(wishList.getCreatedAt().format(formatter))
                                .build();
        }

        private ProductSummaryDto mapToProductSummaryDto(Product product) {
                return ProductSummaryDto.builder()
                                .id(product.getProductId())
                                .name(product.getProductName())
                                .imageUrl(product.getImageUrl())
                                .category(product.getCategory())
                                .estimatedValue(product.getEstimatedValue())
                                .build();
        }
}
