package com.greenloop.greenloop.auth.application;


import com.greenloop.greenloop.auth.dto.JwtRes;
import com.greenloop.greenloop.auth.dto.LoginReq;
import com.greenloop.greenloop.auth.dto.RegisterReq;
import jakarta.validation.Valid;

public interface IAuthUseCase {

    JwtRes register(@Valid RegisterReq request);

    JwtRes login(@Valid LoginReq request);
}
