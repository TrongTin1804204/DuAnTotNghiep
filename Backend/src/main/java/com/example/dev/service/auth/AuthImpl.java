package com.example.dev.service.auth;

import com.example.dev.DTO.UserLogin.UserLogin;
import com.example.dev.DTO.response.auth.LoginResponse;
import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.customer.KhachHang;
import com.example.dev.entity.nhanvien.NhanVien;
import com.example.dev.repository.NhanVienRepo;
import com.example.dev.repository.customer.KhachHangRepo;
import com.example.dev.repository.customer.KhachHangRepository;
import com.example.dev.security.JWTService;
import com.example.dev.service.EmailService;
import com.example.dev.util.IUtil;
import com.example.dev.util.baseModel.BaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthImpl implements AuthService {

    private final KhachHangRepo khachHangRepository;
    private final NhanVienRepo nhanVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final EmailService emailService;
    private final IUtil iUtil;

    @Override
    public LoginResponse login(String username, String password, boolean isCustomer) {

        if (isCustomer) {
            KhachHang khachHang = khachHangRepository.findBySoDienThoai(username).orElse(null);
            if (khachHang != null) {
                if (passwordEncoder.matches(password, khachHang.getMatKhau())) {
                    UserLogin userLogin = UserLogin.builder()
                            .id(khachHang.getIdKhachHang())
                            .userName(khachHang.getHoTen())
                            .phoneNum(khachHang.getSoDienThoai())
                            .permissions(List.of("CUSTOMER"))
                            .build();
                    return LoginResponse.builder()
                            .token(jwtService.generateToken(userLogin))
                            .refreshToken(jwtService.generateRefreshToken(userLogin))
                            .build();
                }
            }
        } else {
            NhanVien nhanVien = nhanVienRepository.findBySoDienThoai(username).orElse(null);
            if (nhanVien != null) {
                if (passwordEncoder.matches(password, nhanVien.getMatKhau())) {
                    UserLogin userLogin = UserLogin.builder()
                            .id(nhanVien.getIdNhanVien())
                            .userName(nhanVien.getTen())
                            .phoneNum(nhanVien.getSoDienThoai())
                            .permissions(List.of(nhanVien.getVaiTro()))
                            .build();
                    return LoginResponse.builder()
                            .token(jwtService.generateToken(userLogin))
                            .refreshToken(jwtService.generateRefreshToken(userLogin))
                            .build();
                }
            }
        }
        return null;
    }

    @Override
    public LoginResponse getToken(Authentication authentication) {
        UserLogin userLogin = (UserLogin) authentication.getPrincipal();
        return LoginResponse.builder()
                .token(jwtService.generateToken(userLogin))
                .refreshToken(jwtService.generateRefreshToken(userLogin))
                .build();
    }

    @Override
    public BaseResponse<?> signUp(KhachHang khachHang) {
        try {
            String encodePassword = passwordEncoder.encode(khachHang.getMatKhau());
            khachHang.setTrangThai(true);
            khachHang.setGioiTinh(true);
            khachHang.setMatKhau(encodePassword);
            khachHangRepository.save(khachHang);

            // Gửi email thông tin tài khoản
            emailService.sendAccountInfo(
                    khachHang.getEmail(),
                    khachHang.getHoTen(),
                    khachHang.getSoDienThoai(),
                    khachHang.getEmail());

            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.SUCCESS.getCode())
                    .message("Success")
                    .build();
        } catch (Exception e) {
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.ERROR.getCode())
                    .message(e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<?> updatePassword(String username, String oldPassword, String newPassword, boolean isCustomer) {
        try {
            if (isCustomer) {
                KhachHang khachHang = khachHangRepository.findBySoDienThoai(username)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tên tài khoản!"));
                if (!passwordEncoder.matches(oldPassword, khachHang.getMatKhau())) {
                    throw new RuntimeException("Mật khẩu cũ không trùng khớp");
                }
                khachHang.setMatKhau(passwordEncoder.encode(newPassword));
                khachHangRepository.save(khachHang);
            } else {
                NhanVien nhanVien = nhanVienRepository.findBySoDienThoai(username)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tên tài khoản!"));
                if (!passwordEncoder.matches(oldPassword, nhanVien.getMatKhau())) {
                    throw new RuntimeException("Mật khẩu cũ không trùng khớp");
                }
                nhanVien.setMatKhau(passwordEncoder.encode(newPassword));
                nhanVienRepository.save(nhanVien);
            }
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.SUCCESS.getCode())
                    .message("Success")
                    .build();
        } catch (Exception e) {
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.ERROR.getCode())
                    .message(e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<?> forgotPassword(String username, boolean isCustomer) {
        try {
            if (username.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu");
            }
            String randomPassword = iUtil.generatePassword();

            if (isCustomer) {
                KhachHang khachHang = khachHangRepository.findByEmailOrPhonenum(username).orElseThrow();
                emailService.sendNewPassword(
                        khachHang.getEmail(),
                        khachHang.getSoDienThoai(),
                        randomPassword,
                        khachHang.getHoTen());
                khachHang.setMatKhau(passwordEncoder.encode(randomPassword));
                khachHangRepository.save(khachHang);
            } else {
                NhanVien nhanVien = nhanVienRepository.findByEmailOrPhonenum(username).orElseThrow();
                emailService.sendNewPassword(
                        nhanVien.getEmail(),
                        nhanVien.getSoDienThoai(),
                        randomPassword,
                        nhanVien.getTen());
                nhanVien.setMatKhau(passwordEncoder.encode(randomPassword));
                nhanVienRepository.save(nhanVien);
            }
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.SUCCESS.getCode())
                    .message("Success")
                    .build();
        } catch (Exception e) {
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.ERROR.getCode())
                    .message(e.getMessage())
                    .build();
        }
    }
}
