package com.example.dev.service.dashboard;

import com.example.dev.DTO.response.DashboardResponse.ChartDataResponse;
import com.example.dev.DTO.response.DashboardResponse.OrderDashboardResponse;
import com.example.dev.DTO.response.DashboardResponse.RevenueStatisticsResponse;
import com.example.dev.DTO.response.DashboardResponse.TrendingProductResponse;
import com.example.dev.entity.ChiTietSanPham;
import com.example.dev.entity.HinhAnh;
import com.example.dev.entity.customer.KhachHang;
import com.example.dev.entity.invoice.HoaDon;
import com.example.dev.repository.ChiTietSanPhamRepo;
import com.example.dev.repository.HinhAnhRepo;
import com.example.dev.repository.NhanVienRepo;
import com.example.dev.repository.attribute.SanPhamRepo;
import com.example.dev.repository.customer.KhachHangRepo;
import com.example.dev.repository.invoice.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final HoaDonRepository hoaDonRepository;
    private final ChiTietSanPhamRepo chiTietSanPhamRepo;
    private final KhachHangRepo khachHangRepo;
    private final NhanVienRepo nhanVienRepo;
    private final HinhAnhRepo hinhAnhRepo;

    public List<OrderDashboardResponse> getRecentOrders() {
        return hoaDonRepository.findTop10ByTrangThaiNotOrderByNgayTaoDesc("Hóa đơn trống")
                .stream()
                .map(hd -> {
                    KhachHang khach = hd.getKhachHang();

                    String tenNguoiNhan = hd.getTenNguoiNhan();
                    String soDienThoai = hd.getSoDienThoai();
                    String email = hd.getEmail();

                    if (khach != null) {
                        tenNguoiNhan = tenNguoiNhan != null ? tenNguoiNhan : khach.getHoTen();
                        soDienThoai = soDienThoai != null ? soDienThoai : khach.getSoDienThoai();
                        email = email != null ? email : khach.getEmail();
                    }

                    tenNguoiNhan = tenNguoiNhan != null ? tenNguoiNhan : "Khách lẻ";
                    soDienThoai = soDienThoai != null ? soDienThoai : "Không rõ";
                    email = email != null ? email : "Không rõ";

                    return new OrderDashboardResponse(
                            hd.getIdHoaDon(),
                            hd.getMaHoaDon(),
                            hd.getNgayTao(),
                            hd.getGhiChu(),
                            hd.getLoaiDon(),
                            hd.getTongTien(),
                            hd.getGiaDuocGiam(),
                            hd.getTrangThai(),
                            tenNguoiNhan,
                            soDienThoai,
                            email
                    );
                })
                .collect(Collectors.toList());
    }

    public RevenueStatisticsResponse getRevenueStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastMonthDate = today.minusMonths(1);

        List<HoaDon> allHoaDons = hoaDonRepository.findAll();

        Predicate<HoaDon> validStatus = h -> {
            String tt = h.getTrangThai();
            return  tt.equals("Đã hoàn thành");
        };

        BigDecimal todayRevenue = sumByDate(allHoaDons, today, validStatus);
        BigDecimal yesterdayRevenue = sumByDate(allHoaDons, yesterday, validStatus);
        BigDecimal monthlyRevenue = sumByMonth(allHoaDons, today.getMonthValue(), today.getYear(), validStatus);
        BigDecimal lastMonthRevenue = sumByMonth(allHoaDons, lastMonthDate.getMonthValue(), lastMonthDate.getYear(), validStatus);
        BigDecimal yearlyRevenue = sumByYear(allHoaDons, today.getYear(), validStatus);
        BigDecimal lastYearRevenue = sumByYear(allHoaDons, today.getYear() - 1, validStatus);

        int totalOrders = (int) allHoaDons.stream().filter(validStatus).count();
        int totalProducts = (int) chiTietSanPhamRepo.countActiveOriginalProducts();

        int totalKH = (int) khachHangRepo.count();
        int totalNV = (int) nhanVienRepo.count();
        int totalUsers = totalKH+totalNV;

        return new RevenueStatisticsResponse(
                todayRevenue,
                yesterdayRevenue,
                monthlyRevenue,
                lastMonthRevenue,
                yearlyRevenue,
                lastYearRevenue,
                totalUsers,
                totalProducts,
                totalOrders,
                calcPercentage(todayRevenue, yesterdayRevenue),
                calcPercentage(monthlyRevenue, lastMonthRevenue),
                calcPercentage(yearlyRevenue, lastYearRevenue)
        );
    }

    private BigDecimal sumByDate(List<HoaDon> allHoaDons, LocalDate date, Predicate<HoaDon> validStatus) {
        return allHoaDons.stream()
                .filter(h -> h.getNgayTao().toLocalDate().equals(date))
                .filter(validStatus)
                .map(h -> {
                    BigDecimal tongTien = h.getTongTien() != null ? h.getTongTien() : BigDecimal.ZERO;
                    BigDecimal phiVanChuyen = h.getPhiVanChuyen() != null ? h.getPhiVanChuyen() : BigDecimal.ZERO;
                    return tongTien.subtract(phiVanChuyen);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumByMonth(List<HoaDon> allHoaDons, int month, int year, Predicate<HoaDon> validStatus) {
        return allHoaDons.stream()
                .filter(h -> h.getNgayTao().getMonthValue() == month && h.getNgayTao().getYear() == year)
                .filter(validStatus)
                .map(h -> {
                    BigDecimal tongTien = h.getTongTien() != null ? h.getTongTien() : BigDecimal.ZERO;
                    BigDecimal phiVanChuyen = h.getPhiVanChuyen() != null ? h.getPhiVanChuyen() : BigDecimal.ZERO;
                    return tongTien.subtract(phiVanChuyen);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumByYear(List<HoaDon> allHoaDons, int year, Predicate<HoaDon> validStatus) {
        return allHoaDons.stream()
                .filter(h -> h.getNgayTao().getYear() == year)
                .filter(validStatus)
                .map(h -> {
                    BigDecimal tongTien = h.getTongTien() != null ? h.getTongTien() : BigDecimal.ZERO;
                    BigDecimal phiVanChuyen = h.getPhiVanChuyen() != null ? h.getPhiVanChuyen() : BigDecimal.ZERO;
                    return tongTien.subtract(phiVanChuyen);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double calcPercentage(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return 100.0;
        }
        if (current == null) {
            current = BigDecimal.ZERO;
        }
        BigDecimal diff = current.subtract(previous);
        BigDecimal percent = diff.divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        return percent.doubleValue();
    }

    public ChartDataResponse getDailyRevenue(LocalDate start, LocalDate end) {
        List<String> categories = new ArrayList<>();
        List<Long> orderCounts = new ArrayList<>();
        List<Long> revenues = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            categories.add(date.toString());
            orderCounts.add(hoaDonRepository.countByDate(date));
            Long dailyRevenue = hoaDonRepository.sumRevenueByDate(date);
            revenues.add(dailyRevenue != null ? dailyRevenue : 0L);
        }

        List<ChartDataResponse.SeriesData> series = List.of(
                new ChartDataResponse.SeriesData("Số đơn hàng", orderCounts),
                new ChartDataResponse.SeriesData("Doanh thu", revenues)
        );

        return new ChartDataResponse(categories, series);
    }

    public List<TrendingProductResponse> getLowStockProducts() {
        int threshold = 10;
        List<ChiTietSanPham> list = chiTietSanPhamRepo.findLowStockChiTietSanPham(threshold);

        return list.stream().map(ctsp -> {
            TrendingProductResponse dto = new TrendingProductResponse();
            dto.setProductId(ctsp.getIdChiTietSanPham());
            dto.setName(ctsp.getSanPham().getTen());
            dto.setSold(ctsp.getSoLuong());
            dto.setSize(ctsp.getKichCo().getTen());
            dto.setPrice(ctsp.getGia().longValue());

            List<HinhAnh> images = hinhAnhRepo.findHinhAnhBySanPham_IdSanPhamAndMauSac_IdMauSac(
                    ctsp.getSanPham().getIdSanPham(),
                    ctsp.getMauSac().getIdMauSac()
            );

            String imageUrl = images != null && !images.isEmpty() ? images.get(0).getLienKet() : null;
            dto.setImage(imageUrl);

            return dto;
        }).collect(Collectors.toList());
    }

}
