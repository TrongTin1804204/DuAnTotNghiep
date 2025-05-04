package com.example.dev.service.auth;

import com.example.dev.DTO.response.auth.LoginResponse;
import com.example.dev.entity.customer.KhachHang;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.security.core.Authentication;

public interface AuthService {
    LoginResponse login(String username, String password, boolean isCustomer);

    LoginResponse getToken(Authentication authentication);

    BaseResponse<?> signUp(KhachHang khachHang);

    BaseResponse<?> updatePassword(String username, String oldPassword, String newPassword, boolean isCustomer);

    BaseResponse<?> forgotPassword(String username, boolean isCustomer);
}
