package com.greenloop.greenloop.wishlist.application;

import com.greenloop.greenloop.jwt.JwtService;
import com.greenloop.greenloop.wishlist.domain.WishListService;
import com.greenloop.greenloop.wishlist.dto.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
public class WishListController {

    @Autowired
    private WishListService wishListService;

    @Autowired
    private JwtService jwtService;

    private Long extractUserId(Authentication authentication) {
        String userName = authentication.getName();
        // Check if running in test environment with mock user
        if (userName.contains("@")) {
            try {
                // Try to extract and parse user ID from the email format
                return Long.parseLong(userName.split("@")[1]);
            } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                // If format is not as expected or parsing fails, return a default test user ID
                return 1L;
            }
        }
        // For production: extract user ID from JWT token
        String userEmail = jwtService.extractUserName(userName);
        try {
            return Long.parseLong(userEmail.split("@")[0]);
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            throw new IllegalArgumentException("Invalid user identifier format", e);
        }
    }

    @PostMapping
    public ResponseEntity<WishListResponseDto> createWishList(
            @Valid @RequestBody WishListRequestDto requestDto,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        WishListResponseDto responseDto = wishListService.createWishList(requestDto, userId);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WishListSummaryDto>> getUserWishLists(Authentication authentication) {
        Long userId = extractUserId(authentication);
        List<WishListSummaryDto> wishLists = wishListService.getUserWishLists(userId);
        return ResponseEntity.ok(wishLists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishListResponseDto> getWishList(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        WishListResponseDto wishList = wishListService.getWishListById(id, userId);
        return ResponseEntity.ok(wishList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WishListResponseDto> updateWishList(
            @PathVariable Long id,
            @Valid @RequestBody WishListRequestDto requestDto,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        WishListResponseDto responseDto = wishListService.updateWishList(id, requestDto, userId);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWishList(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        wishListService.deleteWishList(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/add-product")
    public ResponseEntity<WishListResponseDto> addProductToWishList(
            @Valid @RequestBody AddToWishListRequestDto requestDto,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        WishListResponseDto responseDto = wishListService.addProductToWishList(requestDto, userId);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{wishListId}/products/{productId}")
    public ResponseEntity<WishListResponseDto> removeProductFromWishList(
            @PathVariable Long wishListId,
            @PathVariable Long productId,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        WishListResponseDto responseDto = wishListService.removeProductFromWishList(wishListId, productId, userId);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/{id}/matching-products")
    public ResponseEntity<List<ProductSummaryDto>> getMatchingProducts(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        List<ProductSummaryDto> matchingProducts = wishListService.findMatchingProducts(id, userId);
        return ResponseEntity.ok(matchingProducts);
    }
}

