package com.greenloop.greenloop.notification.domain;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {

    private final Long userId;
    private final String title;
    private final String message;
    private final NotificationType type;
    private final Long referenceId;
    private final String actionUrl;
    private final boolean sendEmail;

    public NotificationEvent(Object source, Long userId, String title, String message,
                             NotificationType type, Long referenceId, String actionUrl,
                             boolean sendEmail) {
        super(source);
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.actionUrl = actionUrl;
        this.sendEmail = sendEmail;
    }
}
