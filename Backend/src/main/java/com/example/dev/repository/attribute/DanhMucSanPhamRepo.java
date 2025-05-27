package com.example.dev.repository.attribute;

import com.example.dev.entity.attribute.DanhMucSanPham;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DanhMucSanPhamRepo extends JpaRepository<DanhMucSanPham,Integer> {
    List<DanhMucSanPham> findAllByTrangThaiIsTrue();

    Optional<DanhMucSanPham> findByTen(@NotEmpty String ten);

}
