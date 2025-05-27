package com.example.dev.controller.attribute;


import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.DanhMucSanPham;
import com.example.dev.service.attribute.DanhMucService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/danh-muc")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class DanhMucSanPhamController {
    @Autowired
    DanhMucService danhMucService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi(){
        return ResponseEntity.ok(danhMucService.getDanhMucSanPham());
    }

    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan(){
        return ResponseEntity.ok(danhMucService.getDanhMucSanPhamBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themDanhMucSanPham(@RequestBody DanhMucSanPham dmsp) {
        try {
            return BaseResponse.builder()
                    .data(danhMucService.themDanhMucSanPham(dmsp))
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
    public ResponseEntity<?> suaDanhMucSanPham(@RequestBody DanhMucSanPham dmsp){
        try {
            danhMucService.suaDanhMucSanPham(dmsp);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
