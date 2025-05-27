package com.example.dev.repository.attribute;

import com.example.dev.entity.attribute.MuiGiay;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MuiGiayRepo extends JpaRepository<MuiGiay,Integer> {
    List<MuiGiay> findAllByTrangThaiIsTrue();

    Optional<MuiGiay> findByTen(@NotEmpty String ten);

}
