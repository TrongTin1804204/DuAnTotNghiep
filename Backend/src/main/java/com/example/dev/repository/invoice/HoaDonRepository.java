package com.example.dev.repository.invoice;

import com.example.dev.entity.invoice.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    HoaDon findByMaHoaDon(String maHoaDon);

    HoaDon findByIdHoaDon(Integer idHoaDon);

    @Query("SELECT h FROM HoaDon h " +
            "WHERE (:loaiDon IS NULL OR h.loaiDon = :loaiDon) " +
            "AND (:startDate IS NULL OR h.ngayTao >= :startDate) " +
            "AND (:endDate IS NULL OR h.ngayTao <= :endDate) " +
            "AND (:searchQuery IS NULL OR " +
            "LOWER(h.tenNguoiNhan) = LOWER(:searchQuery)" +
            "OR LOWER(h.maHoaDon) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(h.soDienThoai) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(h.email) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) ")
    List<HoaDon> findBySearchCriteria(String loaiDon, LocalDateTime startDate, LocalDateTime endDate, String searchQuery);

//    @Query("SELECT hd FROM HoaDon  hd where  hd.")fsdfds

    List<HoaDon> findAllByTrangThaiEqualsIgnoreCase(String status);


    //
    @Query("SELECT h FROM HoaDon h WHERE h.khachHang.idKhachHang = :idKhachHang")
    List<HoaDon> findHoaDonByKhachHangId(@Param("idKhachHang") Integer idKhachHang);


    ///////////
    List<HoaDon> findTop10ByTrangThaiNotOrderByNgayTaoDesc(String trangThai);

    @Query("""
    SELECT SUM(h.tongTien) FROM HoaDon h
    WHERE CAST(h.ngayTao AS date) = :date
    AND h.trangThai NOT LIKE '%Hủy%'
    AND h.trangThai NOT LIKE '%Hóa đơn trống%'
""")
    Long sumRevenueByDate(@Param("date") LocalDate date);


    @Query("""
    SELECT COUNT(h) FROM HoaDon h
    WHERE CAST(h.ngayTao AS date) = :date
    AND h.trangThai NOT LIKE '%Hủy%'
    AND h.trangThai NOT LIKE '%Hóa đơn trống%'
""")
    Long countByDate(@Param("date") LocalDate date);



    @Query("""
    SELECT SUM(h.tongTien) FROM HoaDon h
    WHERE YEAR(h.ngayTao) = :year
   AND h.trangThai NOT LIKE '%Hủy%'
    AND h.trangThai NOT LIKE '%Hóa đơn trống%'
""")
    Long sumRevenueByYear(@Param("year") int year);

    @Query("""
    SELECT COUNT(h) FROM HoaDon h
    WHERE LOWER(h.trangThai) NOT LIKE '%hủy%'
    AND LOWER(h.trangThai) NOT LIKE '%hóa đơn trống%'
""")
    long countValidOrders();



}
