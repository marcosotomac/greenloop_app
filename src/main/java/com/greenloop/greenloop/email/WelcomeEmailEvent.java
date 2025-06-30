package com.greenloop.greenloop.email;

import lombok.Getter;

@Getter
public class WelcomeEmailEvent {
    final private String email;
    final private String name;

    public WelcomeEmailEvent(Object source, String email, String name) {
        super();
        this.email = email;
        this.name = name;
    }
}