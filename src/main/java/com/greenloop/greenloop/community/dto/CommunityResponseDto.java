package com.greenloop.greenloop.community.dto;

import com.greenloop.greenloop.community.domain.CommunityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponseDto {
    private Long id;
    private String name;
    private String description;
    private UserDto creator;
    private Set<UserDto> members;
    private String createdAt;
    private String location;
    private CommunityType type;
    private int memberCount;
}
