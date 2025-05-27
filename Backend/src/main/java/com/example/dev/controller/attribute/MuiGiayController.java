package com.example.dev.controller.attribute;

import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.MuiGiay;
import com.example.dev.service.attribute.MuiGiayService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/mui-giay")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class MuiGiayController {
    @Autowired
    MuiGiayService muiGiayService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi() {
        return ResponseEntity.ok(muiGiayService.getMg());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan() {
        return ResponseEntity.ok(muiGiayService.getMuiGiayBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themMuiGiay(@RequestBody MuiGiay mg) {
        try {
            return BaseResponse.builder()
                    .data(muiGiayService.themMuiGiay(mg))
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
    public ResponseEntity<?> suaMuiGiay(@RequestBody MuiGiay mg) {
        try {
            muiGiayService.suaMuiGiay(mg);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
