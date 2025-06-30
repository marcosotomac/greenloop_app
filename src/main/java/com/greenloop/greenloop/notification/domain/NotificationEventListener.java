package com.greenloop.greenloop.notification.domain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    @Autowired
    private NotificationService notificationService;

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        notificationService.createNotification(
                event.getUserId(),
                event.getTitle(),
                event.getMessage(),
                event.getType(),
                event.getReferenceId(),
                event.getActionUrl());
    }
}