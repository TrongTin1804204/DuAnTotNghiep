package com.example.dev.DTO.response.DashboardResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChartDataResponse {
    private List<String> categories;

    private List<SeriesData> series;

   private Long totalRevenue;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeriesData {
        private String name;
        private List<Long> data;
    }
}

