package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.DanhMucSanPham;
import com.example.dev.repository.attribute.DanhMucSanPhamRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class DanhMucService {
    @Autowired
    DanhMucSanPhamRepo danhMucSanPhamRepo;

    public List<DanhMucSanPham> getDanhMucSanPham(){
        return danhMucSanPhamRepo.findAll();
    }

    public List<DanhMucSanPham> getDanhMucSanPhamBan(){
        return danhMucSanPhamRepo.findAllByTrangThaiIsTrue();
    }

    public DanhMucSanPham themDanhMucSanPham(DanhMucSanPham dmsp) throws Exception {
        String ten = dmsp.getTen().trim();
        Optional<DanhMucSanPham> existing = danhMucSanPhamRepo.findByTen(ten);

        if (ten.isEmpty()) {
            throw new Exception("Không được để trống");
        }

        if (existing.isPresent()) {
            throw new Exception("Danh mục sản phẩm đã tồn tại");
        }

        danhMucSanPhamRepo.save(dmsp);
        return dmsp;
    }


    public void suaDanhMucSanPham(DanhMucSanPham dmsp){
        danhMucSanPhamRepo.save(dmsp);
    }
}
