package com.example.dev.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class InvoiceSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/only-switch-invoice")
    public void onlySwitch(@Payload Map<String, Object> payload) {
//        System.out.println("Only Switch invoice:"+payload);
        messagingTemplate.convertAndSend("/topic/invoice-tracking", payload);
    }

    @MessageMapping("/switch-invoice")
    public void switchInvoice(@Payload Map<String, Object> payload) {
//        System.out.println("Switch invoice:"+payload);
        messagingTemplate.convertAndSend("/topic/invoice-tracking", payload); // gửi về App
    }

    @MessageMapping("/invoice-paid")
    public void invoicePaid(@Payload Map<String, Object> payload) {
//        System.out.println("🎉 Hóa đơn đã thanh toán: " + payload);
        messagingTemplate.convertAndSend("/topic/invoice-paid", payload);
    }


    @MessageMapping("/update-invoice")
    public void updateInvoice(@Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/topic/invoice-tracking", payload);
    }

}
