package com.example.dev.entity.invoice;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "thanh_toan_hoa_don")
@Builder
public class ThanhToanHoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    private String hinhThucThanhToan;

    private String maGiaoDich;
    private String soHoaDon;
    @ManyToOne
    @JoinColumn(name = "id_hoa_don")
    private HoaDon hoaDon;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal soTienThanhToan;

    private String ghiChu;

    private Integer trangThai;
    private String thoiGianGiaoDich;
    @NotNull
    private LocalDateTime ngayTao;

    private LocalDateTime ngaySua;
    @NotNull
    private String nguoiTao;

    private String nguoiSua;

}
