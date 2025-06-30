package com.greenloop.greenloop.auth.dto;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class RegisterReq {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String password;
}
