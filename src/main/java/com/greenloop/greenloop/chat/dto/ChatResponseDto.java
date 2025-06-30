package com.greenloop.greenloop.chat.dto;

import lombok.Data;

@Data
public class ChatResponseDto {
    private Long id;
    private UserBasicDto user1;
    private UserBasicDto user2;
    private Long productId;
    private ProductBasicDto product;

    @Data
    public static class UserBasicDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String level;
        private Integer points;
    }

    @Data
    public static class ProductBasicDto {
        private Long productId;
        private String productName;
        private String description;
    }
}
