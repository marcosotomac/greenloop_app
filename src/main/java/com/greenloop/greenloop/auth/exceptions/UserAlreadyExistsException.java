package com.greenloop.greenloop.auth.exceptions;


public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String role) {
        super(role + " email already exists");
    }
}
