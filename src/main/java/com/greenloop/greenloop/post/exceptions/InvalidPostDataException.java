package com.greenloop.greenloop.post.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidPostDataException extends RuntimeException {

    public InvalidPostDataException(String message) {
        super(message);
    }

    public InvalidPostDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
