package com.example.dev.controller.attribute;

import com.example.dev.DTO.request.SearchRequest.SearchRequest;
import com.example.dev.entity.attribute.SanPham;
import com.example.dev.service.attribute.SanPhamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/admin/san-pham")
public class SanPhamController {
    @Autowired
    SanPhamService sanPhamService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi(@RequestParam(defaultValue = "") String keyword) {
        return ResponseEntity.ok(sanPhamService.getSpDTO(keyword));
    }
//    @GetMapping("/hien-thi")
//    public ResponseEntity<?> hienThi(@RequestBody SearchRequest searchRequest) {
//        return ResponseEntity.ok(sanPhamService.getSpDTO(searchRequest));
//    }
    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan() {
        return ResponseEntity.ok(sanPhamService.getSanPhamBan());
    }

    @GetMapping("/hien-thi/online")
    public ResponseEntity<?> hienThiOnline() {
        return ResponseEntity.ok(sanPhamService.getProductOnl());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/them")
    public ResponseEntity<?> themSp(@RequestBody SanPham sanPham,Authentication authentication) {
        return ResponseEntity.ok(sanPhamService.themSanPham(sanPham,authentication));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/sua")
    public ResponseEntity<?> suaSp(@RequestBody SanPham sanPham, Authentication authentication) {
        try {
            sanPhamService.suaSanPham(sanPham,authentication);
            return ResponseEntity.ok("");
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
