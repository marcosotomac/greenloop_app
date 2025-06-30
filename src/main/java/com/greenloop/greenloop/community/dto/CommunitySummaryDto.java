package com.greenloop.greenloop.community.dto;

import com.greenloop.greenloop.community.domain.CommunityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunitySummaryDto {
    private Long id;
    private String name;
    private String description;
    private int memberCount;
    private String createdAt;
    private UserDto creator;
    private CommunityType type;
}
