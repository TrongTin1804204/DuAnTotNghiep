package com.example.dev.DTO.response.customer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KhachHangResponse {
    private String maKhachHang;
    private String hoTen;
    private Boolean gioiTinh;
    private String soDienThoai;
    private String email;
    private Integer districtId;
    private Integer provinceId;
    private String wardId;
    private String provinceName;
    private String districtName;
    private String wardName;
    private String addressDetails;
}
