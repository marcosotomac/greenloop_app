package com.greenloop.greenloop.post.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class PostAuthorizationException extends RuntimeException {

    public PostAuthorizationException() {
        super("No tienes permiso para realizar esta acción sobre el post");
    }

    public PostAuthorizationException(String message) {
        super(message);
    }
}
