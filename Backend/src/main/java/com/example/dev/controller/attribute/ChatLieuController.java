package com.example.dev.controller.attribute;

import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.attribute.ChatLieu;
import com.example.dev.service.attribute.ChatLieuService;
import com.example.dev.util.baseModel.BaseResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/chat-lieu")
@PreAuthorize("hasAnyAuthority('ADMIN')")
public class ChatLieuController {
    @Autowired
    ChatLieuService chatLieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<?> hienThi(){
        return ResponseEntity.ok(chatLieuService.getChatLieu());
    }


    @GetMapping("/hien-thi/true")
    public ResponseEntity<?> hienThiDangBan(){
        return ResponseEntity.ok(chatLieuService.getChatLieuBan());
    }

    @PostMapping("/them")
    public BaseResponse<?> themChatLieu(@RequestBody ChatLieu cl){
        try {
            return BaseResponse.builder()
                    .data(chatLieuService.themChatLieu(cl))
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
    public ResponseEntity<?> suaChatLieu(@RequestBody ChatLieu cl){
        try {
            chatLieuService.suaChatLieu(cl);
            return ResponseEntity.ok("ok");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
