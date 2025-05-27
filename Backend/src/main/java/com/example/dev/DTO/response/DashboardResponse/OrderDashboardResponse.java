package com.example.dev.DTO.response.DashboardResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDashboardResponse {
    private Integer orderId;
    private String code;
    private LocalDateTime date;
    private String note;
    private String paymentMethod;
    private BigDecimal totalPrice;
    private BigDecimal discount;
    private String status;

    private String userFullName;
    private String userPhone;
    private String userEmail;
}

