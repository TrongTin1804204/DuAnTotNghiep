package com.example.dev.repository.customer;

import com.example.dev.DTO.request.Customer.KhachHangRequest;
import com.example.dev.entity.customer.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepo extends JpaRepository<KhachHang, Integer> {

    @Query("SELECT k FROM KhachHang k WHERE " +
            "(:keyword IS NULL OR LOWER(k.maKhachHang) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:trangThai IS NULL OR k.trangThai = COALESCE(:trangThai, k.trangThai)) AND " +
            "(:gioiTinh IS NULL OR k.gioiTinh = COALESCE(:gioiTinh, k.gioiTinh)) AND " +
            "(:soDienThoai IS NULL OR k.soDienThoai LIKE CONCAT('%', :soDienThoai, '%')) order by k.idKhachHang desc")
    Page<KhachHang> timKiem(@Param("keyword") String keyword,
                            @Param("trangThai") Boolean trangThai,
                            @Param("gioiTinh") Boolean gioiTinh,
                            @Param("soDienThoai") String soDienThoai,
                            Pageable pageable);

    Optional<KhachHang> findBySoDienThoai(String soDienThoai);
    Optional<KhachHang> findByMaKhachHang(String maKhachHang);
    Optional<KhachHang> findByEmail(String email);
    List<KhachHang> findByTrangThaiIsTrue();

    @Query(value = """
    SELECT\s
        kh.id_khach_hang,
        kh.ma_khach_hang,
        kh.ho_ten,
        CASE\s
            WHEN kh.gioi_tinh = 1 THEN N'Nam'
            ELSE N'Nữ'
        END AS gioi_tinh,
        kh.so_dien_thoai,
        kh.email,
        CASE\s
            WHEN kh.trang_thai = 1 THEN N'Còn hoạt động'
            ELSE N'Không hoạt động'
        END AS trang_thai,
        kh.hinh_anh,
        dc.dia_chi_chi_tiet
    FROM\s
        khach_hang kh
    LEFT JOIN\s
        dia_chi dc\s
        ON kh.id_khach_hang = dc.id_khach_hang AND dc.mac_dinh = 1;
    
""",nativeQuery = true)
    List<KhachHangRequest> getAllKh();
}
