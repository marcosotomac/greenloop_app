package com.greenloop.greenloop.User.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BasicUserInfo {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Integer points ;
}
