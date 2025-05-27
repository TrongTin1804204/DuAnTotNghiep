package com.example.dev.controller.attribute;

import com.example.dev.DTO.request.SearchRequest.SearchRequest;
import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.ThuongHieu;
import com.example.dev.service.attribute.ThuongHieuService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/thuong-hieu")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class ThuongHieuController {
    @Autowired
    ThuongHieuService thuongHieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi() {
        return ResponseEntity.ok(thuongHieuService.getTh());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan() {
        return ResponseEntity.ok(thuongHieuService.getThuongHieuBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themThuongHieu(@RequestBody ThuongHieu thuongHieu) {
        try {
            return BaseResponse.builder()
                    .data(thuongHieuService.themThuongHieu(thuongHieu))
                    .code(BaseConstant.CustomResponseCode.SUCCESS.getCode())
                    .message(BaseConstant.CustomResponseCode.SUCCESS.getMessage())
                    .build();
        } catch (Exception e) {
            return BaseResponse.builder()
                    .code(BaseConstant.CustomResponseCode.ERROR.getCode())
                    .message(e.getMessage())
                    .build();
        }
    }


    @PostMapping("/sua")
    public ResponseEntity<?> suaThuongHieu(@RequestBody ThuongHieu thuongHieu) {
        try {
            thuongHieuService.suaThuongHieu(thuongHieu);
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
