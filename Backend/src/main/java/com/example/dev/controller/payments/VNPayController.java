package com.example.dev.controller.payments;


import com.example.dev.service.invoice.HoaDonService;
import com.example.dev.service.payments.VNPayService;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.*;

import static com.example.dev.security.JWTFilter.IP_ADDRESS;

@RestController
@RequestMapping("/api/payment")
public class VNPayController {
    @Autowired
    private VNPayService vnpayService;
    @Autowired
    private HoaDonService hoaDonService;

    @GetMapping("/create")
    public ResponseEntity<?> createPayment(@RequestParam long amount, @RequestParam(required = false) String bankCode, @RequestParam(required = false) String language) {
        return ResponseEntity.ok(vnpayService.createPaymentUrl(amount, bankCode, language));
    }

    @PostMapping("/query")
    public ResponseEntity<?> queryTransaction(@RequestParam String transDate, @RequestParam String createDate, @RequestParam String vnp_TxnRef,@RequestParam(required = false) String vnp_TransactionNo) {
        String requestJson = vnpayService.queryTransaction(transDate, createDate, vnp_TxnRef,vnp_TransactionNo);
        return ResponseEntity.ok(vnpayService.sendQueryToVnpay(requestJson));
    }

//    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
//    @PostMapping("/VNPay-return/{idHoaDon}")
//    public ResponseEntity<?> VNPayReturn(
//            @RequestParam String transactionType,
//            @RequestParam String vnp_TxnRef,
//            @RequestParam long amount,
//            @RequestParam String vnp_TransactionDate,
//            @PathVariable Integer idHoaDon,
//            Authentication authentication
//            ) {
//        return ResponseEntity.ok(vnpayService.refundToVNPay(transactionType,vnp_TxnRef,amount,vnp_TransactionDate,idHoaDon,authentication));
//    }


    // Tin them
//    @GetMapping("/vnpay-return")
//    @PermitAll
//    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response, HttpSession session) throws IOException {
//        boolean isSuccess = hoaDonService.xuLyKetQuaThanhToan(params);
//        if (isSuccess) {
//            session.removeAttribute("cart");
//        }
//        // Chuyển hướng nhưng thêm tham số `success=true` hoặc `success=false`
//        response.sendRedirect("http://localhost:3000/payment-status?success=" + isSuccess);
//    }


//    @PostMapping("/refund")
//    public ResponseEntity<?> refundPayment(@RequestParam String vnp_TxnRef,// là id hóa đơn
//                                           @RequestParam BigDecimal refundAmount,
//                                           @RequestParam String transactionNo,
//                                           @RequestParam String transDate) throws UnsupportedEncodingException {
//        String vnp_IpAddr = IP_ADDRESS;
//        String requestJson = vnpayService.refundTransaction(vnp_TxnRef, refundAmount, transactionNo, transDate, vnp_IpAddr);
//        String reponse = vnpayService.sendQueryToVnpay(requestJson);
//        System.out.println("VNPay Response: " + reponse);
//        return ResponseEntity.ok(reponse);
//    }


}
