package com.example.dev.repository.attribute;

import com.example.dev.DTO.response.product.SanPhamDTO;
import com.example.dev.DTO.response.product.SanPhamOnlResponse;
import com.example.dev.entity.attribute.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface SanPhamRepo extends JpaRepository<SanPham, Integer> {
//    @Modifying
//    @Transactional
//    @Query("UPDATE SanPham sp SET sp.ten = :tenSanPham, sp.trangThai = :trangThai, sp.ngaySua = :ngaySua WHERE sp.idSanPham = :idSanPham")
//    void updateSanPham(@Param("tenSanPham") String tenSanPham, @Param("trangThai") Boolean trangThai, @Param("ngaySua") LocalDateTime ngaySua, @Param("idSanPham") Integer id);

    @Query(value = "exec searchProduct :keyword", nativeQuery = true)
    List<SanPhamDTO> getAll(@Param("keyword") String keyword);


    List<SanPham> findAllByTrangThaiIsTrue();

    Page<SanPham> findByTenContaining(String tenSanPham, Pageable pageable);

    @Query(value = """
                exec sp_LaySanPham
            """, nativeQuery = true)
    List<SanPhamOnlResponse> getListProductOnl();
}
