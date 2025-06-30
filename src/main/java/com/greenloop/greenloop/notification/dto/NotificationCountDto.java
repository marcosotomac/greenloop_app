package com.greenloop.greenloop.notification.dto;

import lombok.*;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCountDto {
    private long total;
    private long unread;

    public NotificationCountDto(long count) {
        this.total = count;
        this.unread = count;
    }
}
