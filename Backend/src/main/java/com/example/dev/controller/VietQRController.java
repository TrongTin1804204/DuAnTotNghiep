package com.example.dev.controller;

import com.example.dev.DTO.request.VietQRRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/vietqr")
public class VietQRController {

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createQuickLink(@RequestBody VietQRRequest request) {
        Integer invoiceId = request.getInvoiceId();
        BigDecimal tongTien = request.getSoTienChuyenKhoan();

        if (invoiceId == null || invoiceId <= 0 || tongTien == null || tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", " Thiếu hoặc sai thông tin invoiceId hoặc tongTien"));
        }

        int amountInt = tongTien.setScale(0, BigDecimal.ROUND_DOWN).intValue();

        String bankId = "970422"; // MB Bank
        String accountNo = "0377175034";
        String template = "compact"; // có thể đổi: compact, print, default
        String accountName = "NGUYEN TRONG TIN";
        String addInfo = "Thanh toan hoa don #" + invoiceId;

        // ✅ Tạo URL mã QR dạng ảnh
        String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                bankId,
                accountNo,
                template,
                amountInt,
                URLEncoder.encode(addInfo, StandardCharsets.UTF_8),
                URLEncoder.encode(accountName, StandardCharsets.UTF_8)
        );

        return ResponseEntity.ok(Map.of("qrUrl", qrUrl));
    }
}
