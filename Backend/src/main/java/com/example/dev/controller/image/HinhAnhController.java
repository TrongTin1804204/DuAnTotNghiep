package com.example.dev.controller.image;

import com.example.dev.service.CloudinaryService;
import com.example.dev.service.image.HinhAnhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hinh-anh")
@RequiredArgsConstructor
public class HinhAnhController {
    private final HinhAnhService hinhAnhService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/hien-thi/{idSanPham}")
    public ResponseEntity<?> hienThi(@PathVariable Integer idSanPham) {
        return ResponseEntity.ok(hinhAnhService.getAllImageByProduct(idSanPham));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/delete")
    public ResponseEntity<?> delete(@RequestParam String publicUrl) {
        try {
            cloudinaryService.deleteImageProductDetail(publicUrl);
            return ResponseEntity.ok("Xóa thành công");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @GetMapping("/show/{idChiTietSanPham}")
    public ResponseEntity<?> show(@PathVariable Integer idChiTietSanPham) {
        return ResponseEntity.ok(hinhAnhService.getUrlByProductDetail(idChiTietSanPham));
    }


}
