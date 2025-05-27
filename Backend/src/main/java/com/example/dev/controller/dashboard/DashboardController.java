package com.example.dev.controller.dashboard;

import com.example.dev.DTO.response.DashboardResponse.ChartDataResponse;
import com.example.dev.DTO.response.DashboardResponse.OrderDashboardResponse;
import com.example.dev.DTO.response.DashboardResponse.RevenueStatisticsResponse;
import com.example.dev.DTO.response.DashboardResponse.TrendingProductResponse;
import com.example.dev.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/orders/recent")
    public ResponseEntity<List<OrderDashboardResponse>> getRecentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders());
    }

    @GetMapping("/revenue/statistics")
    public ResponseEntity<RevenueStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(dashboardService.getRevenueStatistics());
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<ChartDataResponse> getDailyRevenue(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(dashboardService.getDailyRevenue(start, end));
    }

    @GetMapping("/products/low-stock")
    public ResponseEntity<List<TrendingProductResponse>> getLowStockProducts() {
        List<TrendingProductResponse> products = dashboardService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }

}

