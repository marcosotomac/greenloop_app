package com.greenloop.greenloop.dashboard.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private String type; // "donation", "exchange", "community", "user_joined"
    private String userInitial;
    private String userName;
    private String action;
    private String itemName;
    private LocalDateTime createdAt;
    private String timeAgo;
}
