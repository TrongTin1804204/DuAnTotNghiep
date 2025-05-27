package com.example.dev.DTO.response.DashboardResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrendingProductResponse {
    private Integer productId;
    private String name;
    private String category;
    private String size;
    private int sold;
    private Long price;
    private String image;
}

