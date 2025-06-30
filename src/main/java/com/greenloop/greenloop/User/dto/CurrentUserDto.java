package com.greenloop.greenloop.User.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String level;
    private Integer points;
    private String role;
}
