package com.greenloop.greenloop.community.exceptions;

public class CommunityAuthorizationException extends RuntimeException {
    public CommunityAuthorizationException(String message) {
        super(message);
    }

    public CommunityAuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
}
