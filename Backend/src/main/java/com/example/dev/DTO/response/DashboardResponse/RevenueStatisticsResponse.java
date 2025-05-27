package com.example.dev.DTO.response.DashboardResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueStatisticsResponse {
    private BigDecimal todayRevenue;
    private BigDecimal yesterdayRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal lastMonthRevenue;
    private BigDecimal yearlyRevenue;
    private BigDecimal lastYearRevenue;

    private int totalUsers;
    private int totalProducts;
    private int totalOrders;

    private double todayIncreasePercentage;
    private double monthlyIncreasePercentage;
    private double yearlyIncreasePercentage;
}

