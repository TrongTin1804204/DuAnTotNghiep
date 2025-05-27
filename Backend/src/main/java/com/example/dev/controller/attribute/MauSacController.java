package com.example.dev.controller.attribute;

import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.MauSac;
import com.example.dev.service.attribute.MauSacService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/mau-sac")
public class MauSacController {
    @Autowired
    MauSacService mauSacService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi() {
        return ResponseEntity.ok(mauSacService.getMs());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan() {
        return ResponseEntity.ok(mauSacService.getMauSacBan());
    }

    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/them")
    public BaseResponse<?> themMauSac(@RequestBody MauSac ms) {
        try {
            MauSac m = mauSacService.themMauSac(ms);
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.SUCCESS.getCode())
                    .message("Thêm màu sắc thành công")
                    .data(m)
                    .build();
        } catch (Exception e) {
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.ERROR.getCode())
                    .message(e.getMessage())
                    .build();
        }
    }
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    @PostMapping("/sua")
    public ResponseEntity<?> suaMauSac(@RequestBody MauSac ms) {
        try {
            mauSacService.suaMauSac(ms);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
}
