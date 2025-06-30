package com.greenloop.greenloop.User.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenloop.greenloop.User.domain.UserService;
import com.greenloop.greenloop.User.dto.CurrentUserDto;
import com.greenloop.greenloop.User.dto.UpdateProfileDto;
import com.greenloop.greenloop.User.dto.UserProfileResponseDto;
import com.greenloop.greenloop.community.dto.CommunityDto;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName(); // El email del usuario autenticado

            CurrentUserDto currentUser = userService.getCurrentUser(email);
            return ResponseEntity.ok(currentUser);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener el usuario actual: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/communities")
    public ResponseEntity<List<CommunityDto>> getUserCommunities(@PathVariable Long id) {
        List<CommunityDto> communities = userService.getUserCommunities(id);
        return ResponseEntity.ok(communities);
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        try {
            UserProfileResponseDto profile = userService.getUserProfile(id);
            return ResponseEntity.ok(profile);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener el perfil del usuario: " + e.getMessage());
        }
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateProfileDto updateProfileDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName(); // El email del usuario autenticado

            UserProfileResponseDto updatedProfile = userService.updateProfile(email, updateProfileDto);
            return ResponseEntity.ok(updatedProfile);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar el perfil: " + e.getMessage());
        }
    }

}
