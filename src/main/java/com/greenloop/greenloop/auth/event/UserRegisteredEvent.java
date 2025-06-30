package com.greenloop.greenloop.auth.event;

import com.greenloop.greenloop.User.domain.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserRegisteredEvent extends ApplicationEvent {
    private final User registeredUser;

    public UserRegisteredEvent(User registeredUser) {
        super(registeredUser); // Pass the registeredUser as the source
        this.registeredUser = registeredUser;
    }

}