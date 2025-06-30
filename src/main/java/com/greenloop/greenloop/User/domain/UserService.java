package com.greenloop.greenloop.User.domain;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.greenloop.greenloop.User.dto.CurrentUserDto;
import com.greenloop.greenloop.User.dto.UpdateProfileDto;
import com.greenloop.greenloop.User.dto.UserProfileDto;
import com.greenloop.greenloop.User.dto.UserProfileResponseDto;
import com.greenloop.greenloop.User.infrastructure.UserRepository;
import com.greenloop.greenloop.community.dto.CommunityDto;
import com.greenloop.greenloop.wishlist.domain.WishList;
import com.greenloop.greenloop.wishlist.dto.WishListSummaryDto;
import com.greenloop.greenloop.wishlist.infrastructure.WishListRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

        @Autowired
        UserRepository userRepository;

        @Autowired
        private WishListRepository wishListRepository;

        public User saveUser(User user) {
                return userRepository.save(user);
        }

        public User getUserById(Long id) {
                return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        }

        public User getUserByEmail(String email) {
                return userRepository.findByEmail(email);
        }

        public User updateUser(User user) {
                return userRepository.save(user);
        }

        public User deleteUser(Long id) {
                User user = getUserById(id);
                if (user != null) {
                        userRepository.delete(user);
                }
                return user;
        }

        @Transactional(readOnly = true)
        public List<CommunityDto> getUserCommunities(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                return user.getCommunities().stream()
                                .map(community -> CommunityDto.builder()
                                                .id(community.getId())
                                                .name(community.getName())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public UserProfileDto getBasicUserProfile(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                List<CommunityDto> communities = user.getCommunities().stream()
                                .map(community -> CommunityDto.builder()
                                                .id(community.getId())
                                                .name(community.getName())
                                                .build())
                                .collect(Collectors.toList());

                return UserProfileDto.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                // Otros campos existentes
                                .communities(communities)
                                .build();
        }

        @Transactional(readOnly = true)
        public UserProfileResponseDto getUserProfile(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // Obtener las comunidades del usuario
                List<CommunityDto> communityDtos = user.getCommunities().stream()
                                .map(community -> CommunityDto.builder()
                                                .id(community.getId())
                                                .name(community.getName())
                                                .build())
                                .collect(Collectors.toList());

                // Obtener las listas de deseos del usuario
                List<WishList> wishLists = wishListRepository.findByUser(user);

                List<WishListSummaryDto> wishListSummaries = wishLists.stream()
                                .map(wl -> WishListSummaryDto.builder()
                                                .id(wl.getId())
                                                .name(wl.getName())
                                                .productCount(wl.getProducts().size())
                                                .isPublic(wl.isPublic())
                                                .build())
                                .collect(Collectors.toList());

                // Construir y retornar el DTO
                return UserProfileResponseDto.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .address(user.getAddress())
                                .description(user.getDescription())
                                .joinedAt(user.getJoinedAt())
                                .points(user.getPoints())
                                .level(user.getLevel())
                                .itemsDonated(user.getItemsDonated())
                                .itemsExchanged(user.getItemsExchanged())
                                .role(user.getRole())
                                .communities(communityDtos)
                                .wishLists(wishListSummaries)
                                .totalProductsCount(user.getProducts() != null ? user.getProducts().size() : 0)
                                .totalPostsCount(user.getPosts() != null ? user.getPosts().size() : 0)
                                .build();
        }

        @Transactional(readOnly = true)
        public CurrentUserDto getCurrentUser(String email) {
                User user = userRepository.findByEmail(email);
                if (user == null) {
                        throw new EntityNotFoundException("Usuario no encontrado");
                }

                return CurrentUserDto.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .level(user.getLevel())
                                .points(user.getPoints())
                                .role(user.getRole() != null ? user.getRole().name() : "USER")
                                .build();
        }

        @Transactional
        public UserProfileResponseDto updateProfile(String email, UpdateProfileDto updateProfileDto) {
                User user = userRepository.findByEmail(email);
                if (user == null) {
                        throw new EntityNotFoundException("Usuario no encontrado");
                }

                // Actualizar solo los campos permitidos (email NO se puede cambiar)
                if (updateProfileDto.getFirstName() != null) {
                        user.setFirstName(updateProfileDto.getFirstName());
                }
                if (updateProfileDto.getLastName() != null) {
                        user.setLastName(updateProfileDto.getLastName());
                }
                if (updateProfileDto.getAddress() != null) {
                        user.setAddress(updateProfileDto.getAddress());
                }
                if (updateProfileDto.getDescription() != null) {
                        user.setDescription(updateProfileDto.getDescription());
                }

                User updatedUser = userRepository.save(user);

                // Retornar el perfil completo actualizado
                return getUserProfile(updatedUser.getId());
        }

}
