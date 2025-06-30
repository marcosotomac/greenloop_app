package com.greenloop.greenloop.post.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.greenloop.greenloop.User.dto.BasicUserInfo;
import com.greenloop.greenloop.post.domain.Wanted;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostResponseDto {
    private Long postId;
    private String username;
    private String title;
    private String content;
    private String imageUrl;
    private Wanted wanted;
    private String location;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;

    private BasicUserInfo user;

    // Información de likes
    private int likesCount;
    private boolean likedByCurrentUser;
}
