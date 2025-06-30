package com.greenloop.greenloop.wishlist.domain;

import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.notification.domain.NotificationService;
import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.product.domain.Product;
import com.greenloop.greenloop.product.domain.ProductStatus;
import com.greenloop.greenloop.product.infrastructure.ProductRepository;
import com.greenloop.greenloop.wishlist.dto.AddToWishListRequestDto;
import com.greenloop.greenloop.wishlist.dto.ProductSummaryDto;
import com.greenloop.greenloop.wishlist.dto.WishListRequestDto;
import com.greenloop.greenloop.wishlist.dto.WishListResponseDto;
import com.greenloop.greenloop.wishlist.infrastructure.WishListRepository;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WishListServiceTest {

    @Mock
    private WishListRepository wishListRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private WishListService wishListService;

    private User testUser;
    private Product testProduct;
    private WishList testWishList;
    private WishListRequestDto wishListRequestDto;
    private AddToWishListRequestDto addToWishListRequestDto;
    private LocalDateTime now;
    private DateTimeFormatter formatter;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();
        formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.USER);

        // Setup another user for product owner
        User productOwner = new User();
        productOwner.setId(2L);
        productOwner.setFirstName("Jane");
        productOwner.setLastName("Smith");
        productOwner.setEmail("jane.smith@example.com");
        productOwner.setRole(Role.USER);

        // Setup test product
        testProduct = new Product();
        testProduct.setProductId(1L);
        testProduct.setProductName("Test Product");
        testProduct.setDescription("A test product");
        testProduct.setCategory(Category.ELECTRONICS);
        testProduct.setImageUrl("http://example.com/image.jpg");
        testProduct.setEstimatedValue(100.0); // Set estimated value to avoid NullPointerException
        testProduct.setStatus(ProductStatus.ACTIVE);
        testProduct.setUser(productOwner);

        // Setup test wishlist - Make sure to initialize the products list
        testWishList = WishList.builder()
                .id(1L)
                .name("Test Wishlist")
                .description("A test wishlist")
                .user(testUser)
                .isPublic(true)
                .createdAt(now)
                .updatedAt(now)
                .desiredCategories(Collections.singletonList(Category.ELECTRONICS))
                .products(new ArrayList<>()) // Initialize products list to avoid NPE
                .build();

        // Setup wishlist request DTO
        wishListRequestDto = new WishListRequestDto();
        wishListRequestDto.setName("Test Wishlist");
        wishListRequestDto.setDescription("A test wishlist");
        wishListRequestDto.setDesiredCategories(Collections.singletonList(Category.ELECTRONICS));
        wishListRequestDto.setPublic(true);

        // Setup add to wishlist request DTO
        addToWishListRequestDto = new AddToWishListRequestDto();
        addToWishListRequestDto.setWishListId(1L);
        addToWishListRequestDto.setProductId(1L);
    }

    @Test
    void createWishList_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.save(any(WishList.class))).thenAnswer(invocation -> {
            WishList savedWishList = invocation.getArgument(0);
            savedWishList.setId(1L);
            savedWishList.setCreatedAt(now);
            savedWishList.setUpdatedAt(now);
            // Ensure products list is initialized
            if (savedWishList.getProducts() == null) {
                savedWishList.setProducts(new ArrayList<>());
            }
            return savedWishList;
        });

        // When
        WishListResponseDto response = wishListService.createWishList(wishListRequestDto, 1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Wishlist", response.getName());
        assertEquals("A test wishlist", response.getDescription());
        assertEquals(Category.ELECTRONICS, response.getDesiredCategories().get(0));
        assertTrue(response.isPublic());
        assertEquals(0, response.getProductCount());
        assertEquals(now.format(formatter), response.getCreatedAt());
        assertEquals(now.format(formatter), response.getUpdatedAt());

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).save(any(WishList.class));
    }

    @Test
    void createWishList_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            wishListService.createWishList(wishListRequestDto, 99L);
        });

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(userRepository).findById(99L);
        verifyNoInteractions(wishListRepository);
    }

    @Test
    void getUserWishLists_Success() {
        // Given
        List<WishList> wishLists = Collections.singletonList(testWishList);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByUser(testUser)).thenReturn(wishLists);

        // When
        var result = wishListService.getUserWishLists(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("Test Wishlist", result.get(0).getName());
        assertEquals(0, result.get(0).getProductCount());
        assertTrue(result.get(0).isPublic());

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByUser(testUser);
    }

    @Test
    void getWishListById_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findById(1L)).thenReturn(Optional.of(testWishList));

        // When
        var result = wishListService.getWishListById(1L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Wishlist", result.getName());
        assertEquals("A test wishlist", result.getDescription());
        assertEquals(Category.ELECTRONICS, result.getDesiredCategories().get(0));

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findById(1L);
    }

    @Test
    void getWishListById_PrivateWishListOtherUser_ThrowsException() {
        // Given
        User otherUser = new User();
        otherUser.setId(2L);

        testWishList.setPublic(false);

        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(wishListRepository.findById(1L)).thenReturn(Optional.of(testWishList));

        // When & Then
        IllegalAccessError exception = assertThrows(IllegalAccessError.class, () -> {
            wishListService.getWishListById(1L, 2L);
        });

        assertEquals("No tienes acceso a esta lista de deseos", exception.getMessage());
    }

    @Test
    void updateWishList_Success() {
        // Given
        // Create updated request
        WishListRequestDto updatedRequestDto = new WishListRequestDto();
        updatedRequestDto.setName("Updated Wishlist");
        updatedRequestDto.setDescription("Updated description");
        updatedRequestDto.setDesiredCategories(Arrays.asList(Category.CLOTHING, Category.BOOKS));
        updatedRequestDto.setPublic(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(wishListRepository.save(any(WishList.class))).thenAnswer(invocation -> {
            WishList savedWishList = invocation.getArgument(0);
            savedWishList.setUpdatedAt(now);
            return savedWishList;
        });

        // When
        WishListResponseDto response = wishListService.updateWishList(1L, updatedRequestDto, 1L);

        // Then
        assertNotNull(response);
        assertEquals("Updated Wishlist", response.getName());
        assertEquals("Updated description", response.getDescription());
        assertEquals(2, response.getDesiredCategories().size());
        assertTrue(response.getDesiredCategories().contains(Category.CLOTHING));
        assertTrue(response.getDesiredCategories().contains(Category.BOOKS));
        assertFalse(response.isPublic());

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByIdAndUser(1L, testUser);
        verify(wishListRepository).save(any(WishList.class));
    }

    @Test
    void deleteWishList_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));

        // When
        wishListService.deleteWishList(1L, 1L);

        // Then
        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByIdAndUser(1L, testUser);
        verify(wishListRepository).delete(testWishList);
    }

    @Test
    void deleteWishList_NotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(99L, testUser)).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            wishListService.deleteWishList(99L, 1L);
        });

        assertEquals("Lista de deseos no encontrada o no tienes permisos", exception.getMessage());

        // Verify repository calls
        verify(wishListRepository, never()).delete(any());
    }

    @Test
    void addProductToWishList_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(wishListRepository.findByUserAndProduct(any(), anyLong())).thenReturn(Collections.emptyList());
        when(wishListRepository.save(any(WishList.class))).thenReturn(testWishList);

        // When
        WishListResponseDto response = wishListService.addProductToWishList(addToWishListRequestDto, 1L);

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByIdAndUser(1L, testUser);
        verify(productRepository).findById(1L);
        verify(wishListRepository).findByUserAndProduct(testUser, 1L);
        verify(wishListRepository).save(testWishList);

        // Verify product was added to wishlist
        ArgumentCaptor<WishList> wishListCaptor = ArgumentCaptor.forClass(WishList.class);
        verify(wishListRepository).save(wishListCaptor.capture());
        assertTrue(wishListCaptor.getValue().getProducts().contains(testProduct));
    }

    @Test
    void addProductToWishList_OwnProduct_ThrowsException() {
        // Given
        testProduct.setUser(testUser); // Make product belong to the user

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            wishListService.addProductToWishList(addToWishListRequestDto, 1L);
        });

        assertEquals("No puedes añadir tus propios productos a tu lista de deseos", exception.getMessage());

        // Verify wishlist wasn't modified
        verify(wishListRepository, never()).save(any(WishList.class));
    }

    @Test
    void addProductToWishList_ProductInOtherWishList_ThrowsException() {
        // Given
        WishList otherWishList = new WishList();
        otherWishList.setId(2L);
        otherWishList.setUser(testUser);

        List<WishList> existingLists = Collections.singletonList(otherWishList);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(wishListRepository.findByUserAndProduct(testUser, 1L)).thenReturn(existingLists);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            wishListService.addProductToWishList(addToWishListRequestDto, 1L);
        });

        assertEquals("Este producto ya está en otra de tus listas de deseos", exception.getMessage());
    }

    @Test
    void removeProductFromWishList_Success() {
        // Given
        testWishList.addProduct(testProduct);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(wishListRepository.save(any(WishList.class))).thenReturn(testWishList);

        // When
        WishListResponseDto response = wishListService.removeProductFromWishList(1L, 1L, 1L);

        // Then
        assertNotNull(response);

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByIdAndUser(1L, testUser);
        verify(productRepository).findById(1L);
        verify(wishListRepository).save(testWishList);

        // Verify product was removed from wishlist
        ArgumentCaptor<WishList> wishListCaptor = ArgumentCaptor.forClass(WishList.class);
        verify(wishListRepository).save(wishListCaptor.capture());
        assertFalse(wishListCaptor.getValue().getProducts().contains(testProduct));
    }

    @Test
    void removeProductFromWishList_ProductNotInWishList_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            wishListService.removeProductFromWishList(1L, 1L, 1L);
        });

        assertEquals("El producto no está en esta lista de deseos", exception.getMessage());

        // Verify wishlist wasn't modified
        verify(wishListRepository, never()).save(any(WishList.class));
    }

    @Test
    void notifyProductStatusChange_ProductExchanged_RemovesFromWishListAndNotifies() {
        // Given
        testProduct.setStatus(ProductStatus.EXCHANGED);
        testWishList.addProduct(testProduct);

        List<WishList> affectedWishLists = Collections.singletonList(testWishList);

        when(wishListRepository.findAll()).thenReturn(affectedWishLists);
        when(wishListRepository.save(any(WishList.class))).thenReturn(testWishList);

        // When
        wishListService.notifyProductStatusChange(testProduct);

        // Then
        // Verify notification was sent
        verify(notificationService).createNotification(
                eq(testUser.getId()),
                eq("Actualización de lista de deseos"),
                contains("ya no está disponible")
        );

        // Verify product was removed from wishlist
        verify(wishListRepository).save(testWishList);
        assertFalse(testWishList.getProducts().contains(testProduct));
    }

    @Test
    void notifyProductStatusChange_ProductActive_OnlyNotifies() {
        // Given
        testProduct.setStatus(ProductStatus.ACTIVE);
        testWishList.addProduct(testProduct);

        List<WishList> affectedWishLists = Collections.singletonList(testWishList);

        when(wishListRepository.findAll()).thenReturn(affectedWishLists);

        // When
        wishListService.notifyProductStatusChange(testProduct);

        // Then
        // Verify notification was sent
        verify(notificationService).createNotification(
                eq(testUser.getId()),
                eq("Actualización de lista de deseos"),
                contains("está disponible")
        );

        // Verify product was not removed from wishlist
        verify(wishListRepository, never()).save(any(WishList.class));
        assertTrue(testWishList.getProducts().contains(testProduct));
    }

    @Test
    void findMatchingProducts_ReturnsMatchingProductsNotInWishList() {
        // Given
        Product inWishListProduct = new Product();
        inWishListProduct.setProductId(1L);
        inWishListProduct.setStatus(ProductStatus.ACTIVE);
        inWishListProduct.setEstimatedValue(75.0); // Set estimated value here as well

        Product notInWishListProduct = new Product();
        notInWishListProduct.setProductId(2L);
        notInWishListProduct.setProductName("New Product");
        notInWishListProduct.setStatus(ProductStatus.ACTIVE);
        notInWishListProduct.setCategory(Category.ELECTRONICS);
        notInWishListProduct.setEstimatedValue(150.0); // Set estimated value here

        User otherUser = new User();
        otherUser.setId(3L);
        notInWishListProduct.setUser(otherUser);

        testWishList.addProduct(inWishListProduct);

        List<Product> matchingProducts = Arrays.asList(inWishListProduct, notInWishListProduct);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(wishListRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testWishList));
        when(productRepository.findByCategoryInAndStatusAndUserNot(anyList(), eq(ProductStatus.ACTIVE), eq(testUser)))
                .thenReturn(matchingProducts);

        // When
        List<ProductSummaryDto> results = wishListService.findMatchingProducts(1L, 1L);

        // Then
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(2L, results.get(0).getId());
        assertEquals("New Product", results.get(0).getName());
        assertEquals(Category.ELECTRONICS, results.get(0).getCategory());
        assertEquals(150.0, results.get(0).getEstimatedValue()); // Verify estimated value is correctly mapped

        // Verify repository calls
        verify(userRepository).findById(1L);
        verify(wishListRepository).findByIdAndUser(1L, testUser);
        verify(productRepository).findByCategoryInAndStatusAndUserNot(
                eq(testWishList.getDesiredCategories()), eq(ProductStatus.ACTIVE), eq(testUser));
    }
}
