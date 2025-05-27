package com.example.dev.controller.attribute;

import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.CoGiay;
import com.example.dev.service.attribute.CoGiayService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/co-giay")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class CoGiayController{
    @Autowired
    CoGiayService coGiayService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi(){
        return ResponseEntity.ok(coGiayService.getCoGiay());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan(){
        return ResponseEntity.ok(coGiayService.getCoGiayBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themCoGiay(@RequestBody CoGiay cg) {
        try {
            return BaseResponse.builder()
                    .data(coGiayService.themCoGiay(cg))
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
    public ResponseEntity<?> suaCoGiay(@RequestBody CoGiay cg){
        try {
            coGiayService.suaCoGiay(cg);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
