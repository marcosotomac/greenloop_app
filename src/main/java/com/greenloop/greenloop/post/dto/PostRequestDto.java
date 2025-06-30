package com.greenloop.greenloop.post.dto;

import com.greenloop.greenloop.post.domain.Wanted;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostRequestDto {
    private String title;
    private String content;
    private String imageUrl;
    private Wanted wanted;
    private String location;
}
