package com.example.dev.repository.attribute;

import com.example.dev.entity.attribute.ChatLieu;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatLieuRepo extends JpaRepository<ChatLieu,Integer> {
    List<ChatLieu> findAllByTrangThaiIsTrue();

    Optional<ChatLieu> findByTen(@NotEmpty String ten);
}
