package com.example.dev.repository.attribute;

import com.example.dev.entity.attribute.NhaCungCap;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NhaCungCapRepo extends JpaRepository<NhaCungCap, Integer> {
    List<NhaCungCap> findAllByTrangThaiIsTrue();

    Optional<NhaCungCap> findByTen(@NotEmpty String ten);

}
