package com.example.dev.controller.attribute;

import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.DeGiay;
import com.example.dev.service.attribute.DeGiayService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/de-giay")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class DeGiayController {
    @Autowired
    DeGiayService deGiayService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi() {
        return ResponseEntity.ok(deGiayService.getDeGiay());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan() {
        return ResponseEntity.ok(deGiayService.deGiayBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themDeGiay(@RequestBody DeGiay dg) {
        try {
            return BaseResponse.builder()
                    .data(deGiayService.themDeGiay(dg))
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
    public ResponseEntity<?> suaDeGiay(@RequestBody DeGiay dg) {

        try {
            deGiayService.suaDeGiay(dg);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
