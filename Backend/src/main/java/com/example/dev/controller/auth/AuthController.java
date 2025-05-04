package com.example.dev.controller.auth;

import com.example.dev.DTO.request.auth.LoginRequest;
import com.example.dev.DTO.response.auth.LoginResponse;
import com.example.dev.entity.customer.KhachHang;
import com.example.dev.service.auth.AuthService;
import com.example.dev.util.baseModel.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest.getUsername(), loginRequest.getPassword(),
                loginRequest.getIsCustomer()));
    }

    @PostMapping("/get-token")
    public ResponseEntity<?> getToken(Authentication authentication) {
        return ResponseEntity.ok(authService.getToken(authentication));
    }

    @PostMapping("/sign-up")
    public BaseResponse<?> signUp(@RequestBody KhachHang khachHang) {
        return authService.signUp(khachHang);
    }

    @PutMapping("/change-password")
    public BaseResponse<?> changePassword(@RequestParam String username, @RequestParam String oldPassword,
            @RequestParam String newPassword, @RequestParam boolean isCustomer) {
        return authService.updatePassword(username, oldPassword, newPassword, isCustomer);
    }

    @PutMapping("/forgot-password")
    public BaseResponse<?> forgotPassword(@RequestParam String username, @RequestParam boolean isCustomer) {
        return authService.forgotPassword(username, isCustomer);
    }
}
