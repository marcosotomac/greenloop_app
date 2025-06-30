package com.greenloop.greenloop.post.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PostNotFoundException extends RuntimeException {

    public PostNotFoundException(Long postId) {
        super("Post no encontrado con ID: " + postId);
    }

    public PostNotFoundException(String message) {
        super(message);
    }
}
