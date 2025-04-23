package com.example.dev.DTO.request.Customer;


import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public interface KhachHangRequest {
    public Integer getIdKhachHang();
    public String getMaKhachHang();
    public String getHoTen();
    public String getGioiTinh();
    public String getSoDienThoai();
    public String getEmail();
    public String getTrangThai();
    public String getHinhAnh();
    public String getDiaChiChiTiet();
}
