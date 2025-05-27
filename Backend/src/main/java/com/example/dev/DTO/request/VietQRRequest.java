package com.example.dev.DTO.request;

import java.math.BigDecimal;

public class VietQRRequest {
    private Integer invoiceId;
    private BigDecimal soTienChuyenKhoan;
    private BigDecimal tongTienSauCung;

    public BigDecimal getTongTienSauCung() {
        return tongTienSauCung;
    }

    public void setTongTienSauCung(BigDecimal tongTienSauCung) {
        this.tongTienSauCung = tongTienSauCung;
    }

    public Integer getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getSoTienChuyenKhoan() {
        return soTienChuyenKhoan;
    }

    public void setSoTienChuyenKhoan(BigDecimal soTienChuyenKhoan) {
        this.soTienChuyenKhoan = soTienChuyenKhoan;
    }
}

