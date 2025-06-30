package com.greenloop.greenloop.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunitySearchDto {
    private String name;
    private String location;
    private Integer minMembers;
    private Integer maxMembers;
    private String creatorName;
}
