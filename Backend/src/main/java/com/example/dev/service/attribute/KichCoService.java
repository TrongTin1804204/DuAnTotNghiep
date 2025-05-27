package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.KichCo;
import com.example.dev.repository.attribute.KichCoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class KichCoService {
    @Autowired
    KichCoRepo kichCoRepo;

    public List<KichCo> getKc(){
        return kichCoRepo.findAll();
    }

    public List<KichCo> getKichCoBan(){
        return kichCoRepo.findAllByTrangThaiIsTrue();
    }

    public KichCo themKichCo(KichCo kc) throws Exception {
        String ten = kc.getTen().trim();

        // Regex: số nguyên hoặc số .5
        if (!ten.matches("^\\d{2}(\\.5)?$")) {
            throw new Exception("Tên kích cỡ không hợp lệ! Chỉ cho phép dạng số như 38 hoặc 40.5");
        }

        // Ép kiểu và kiểm tra khoảng
        double giaTri = Double.parseDouble(ten);
        if (giaTri < 38 || giaTri > 47) {
            throw new Exception("Kích cỡ phải nằm trong khoảng từ 38 đến 47");
        }

        // Check trùng tên (bỏ qua hoa thường)
        KichCo check = kichCoRepo.findKichCoByTenEqualsIgnoreCase(ten);
        if (check != null) {
            throw new Exception("Kích cỡ đã tồn tại");
        }

        // Lưu vào DB
        kichCoRepo.save(kc);
        return kc;
    }


    public void suaKichCo(KichCo kc){
        kichCoRepo.save(kc);
    }
}
