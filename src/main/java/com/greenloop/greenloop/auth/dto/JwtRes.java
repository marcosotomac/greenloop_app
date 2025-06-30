package com.greenloop.greenloop.auth.dto;



import com.greenloop.greenloop.User.dto.BasicUserInfo;
import lombok.*;

@Getter
@Setter
@Data
@NoArgsConstructor
public class JwtRes {
    private String token;
    private BasicUserInfo user;
    private String pp;
    private String cp;

    public JwtRes(String token) {
        this.token = token;
    }
}
