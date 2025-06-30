package com.greenloop.greenloop.wishlist.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenloop.greenloop.User.domain.Role;
import com.greenloop.greenloop.User.domain.User;
import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.product.domain.Category;
import com.greenloop.greenloop.wishlist.domain.WishListService;
import com.greenloop.greenloop.wishlist.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WishListController.class)
public class WishListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WishListService wishListService;

    @MockitoBean
    private JwtService jwtService;

    private WishListRequestDto wishListRequestDto;
    private WishListResponseDto wishListResponseDto;
    private WishListSummaryDto wishListSummaryDto;
    private AddToWishListRequestDto addToWishListRequestDto;
    private ProductSummaryDto productSummaryDto;
    private List<ProductSummaryDto> productSummaryDtos;
    private List<WishListSummaryDto> wishListSummaryDtos;
    private LocalDateTime now;
    private DateTimeFormatter formatter;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();
        formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Initialize request DTO
        wishListRequestDto = new WishListRequestDto();
        wishListRequestDto.setName("Test Wishlist");
        wishListRequestDto.setDescription("A test wishlist");
        wishListRequestDto.setDesiredCategories(Collections.singletonList(Category.ELECTRONICS));
        wishListRequestDto.setPublic(true);

        // Initialize product summary DTO
        productSummaryDto = ProductSummaryDto.builder()
                .id(1L)
                .name("Test Product")
                .imageUrl("http://example.com/product.jpg")
                .category(Category.ELECTRONICS)
                .estimatedValue(100.0)
                .build();

        // Initialize product summary DTOs list
        productSummaryDtos = Collections.singletonList(productSummaryDto);

        // Initialize response DTO
        wishListResponseDto = WishListResponseDto.builder()
                .id(1L)
                .name("Test Wishlist")
                .description("A test wishlist")
                .desiredCategories(Collections.singletonList(Category.ELECTRONICS))
                .products(productSummaryDtos)
                .createdAt(now.format(formatter))
                .updatedAt(now.format(formatter))
                .isPublic(true)
                .productCount(1)
                .build();

        // Initialize summary DTO
        wishListSummaryDto = WishListSummaryDto.builder()
                .id(1L)
                .name("Test Wishlist")
                .productCount(1)
                .isPublic(true)
                .build();

        // Initialize summary DTOs list
        wishListSummaryDtos = Collections.singletonList(wishListSummaryDto);

        // Initialize add to wishlist request DTO
        addToWishListRequestDto = new AddToWishListRequestDto();
        addToWishListRequestDto.setWishListId(1L);
        addToWishListRequestDto.setProductId(1L);
    }

    @Test
    @WithMockUser(username = "user@1")
    void createWishList_Success() throws Exception {
        // No need to mock jwtService.extractUserName since our controller now handles test authentication
        when(wishListService.createWishList(any(WishListRequestDto.class), eq(1L))).thenReturn(wishListResponseDto);

        // When & Then
        mockMvc.perform(post("/api/wishlists")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wishListRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Wishlist")))
                .andExpect(jsonPath("$.description", is("A test wishlist")))
                .andExpect(jsonPath("$.productCount", is(1)))
                .andExpect(jsonPath("$.isPublic", is(true)));

        verify(wishListService).createWishList(any(WishListRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "user@1")
    void getUserWishLists_Success() throws Exception {
        // Given
        when(wishListService.getUserWishLists(1L)).thenReturn(wishListSummaryDtos);

        // When & Then
        mockMvc.perform(get("/api/wishlists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Test Wishlist")))
                .andExpect(jsonPath("$[0].productCount", is(1)))
                .andExpect(jsonPath("$[0].public", is(true)));

        verify(wishListService).getUserWishLists(1L);
    }

    @Test
    @WithMockUser(username = "user@1")
    void getWishListById_Success() throws Exception {
        // Given
        when(wishListService.getWishListById(1L, 1L)).thenReturn(wishListResponseDto);

        // When & Then
        mockMvc.perform(get("/api/wishlists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Wishlist")))
                .andExpect(jsonPath("$.description", is("A test wishlist")))
                .andExpect(jsonPath("$.productCount", is(1)))
                .andExpect(jsonPath("$.products", hasSize(1)))
                .andExpect(jsonPath("$.products[0].id", is(1)))
                .andExpect(jsonPath("$.products[0].name", is("Test Product")));

        verify(wishListService).getWishListById(1L, 1L);
    }

    @Test
    @WithMockUser(username = "user@1")
    void updateWishList_Success() throws Exception {
        // Given
        when(wishListService.updateWishList(eq(1L), any(WishListRequestDto.class), eq(1L)))
                .thenReturn(wishListResponseDto);

        // When & Then
        mockMvc.perform(put("/api/wishlists/1")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wishListRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Wishlist")))
                .andExpect(jsonPath("$.description", is("A test wishlist")));

        verify(wishListService).updateWishList(eq(1L), any(WishListRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "user@1")
    void deleteWishList_Success() throws Exception {
        // Given
        doNothing().when(wishListService).deleteWishList(1L, 1L);

        // When & Then
        mockMvc.perform(delete("/api/wishlists/1")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());

        verify(wishListService).deleteWishList(1L, 1L);
    }

    @Test
    @WithMockUser(username = "user@1")
    void addProductToWishList_Success() throws Exception {
        // Given
        when(wishListService.addProductToWishList(any(AddToWishListRequestDto.class), eq(1L)))
                .thenReturn(wishListResponseDto);

        // When & Then
        mockMvc.perform(post("/api/wishlists/add-product")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addToWishListRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.productCount", is(1)));

        verify(wishListService).addProductToWishList(any(AddToWishListRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "user@1")
    void removeProductFromWishList_Success() throws Exception {
        // Given
        when(wishListService.removeProductFromWishList(1L, 1L, 1L)).thenReturn(wishListResponseDto);

        // When & Then
        mockMvc.perform(delete("/api/wishlists/1/products/1")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        verify(wishListService).removeProductFromWishList(1L, 1L, 1L);
    }

    @Test
    @WithMockUser(username = "user@1")
    void getMatchingProducts_Success() throws Exception {
        // Given
        when(wishListService.findMatchingProducts(1L, 1L)).thenReturn(productSummaryDtos);

        // When & Then
        mockMvc.perform(get("/api/wishlists/1/matching-products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Test Product")))
                .andExpect(jsonPath("$[0].category", is("ELECTRONICS")));

        verify(wishListService).findMatchingProducts(1L, 1L);
    }
}
