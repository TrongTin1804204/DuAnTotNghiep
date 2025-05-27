package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.DeGiay;
import com.example.dev.repository.attribute.DeGiayRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeGiayService {
    @Autowired
    private DeGiayRepo deGiayRepo;

    public List<DeGiay> getDeGiay() {
        return deGiayRepo.findAll(Sort.by(Sort.Direction.DESC, "idDeGiay"));
    }

    public List<DeGiay> deGiayBan(){
        return deGiayRepo.findAllByTrangThaiIsTrue();
    }
//    public List<DeGiay> getDeGiays(String ten, Boolean trangThai) {
//        if (ten != null && !ten.isEmpty() && trangThai != null) {
//            return deGiayRepo.findByTenAndTrangThai(ten, trangThai);
//        } else if (ten != null && !ten.isEmpty()) {
//            return deGiayRepo.findByTen(ten);
//        } else if (trangThai != null) {
//            return deGiayRepo.findByTrangThai(trangThai);
//        }
//        return getDeGiay();
//    }

    public DeGiay themDeGiay(DeGiay deGiay) throws Exception {
        String ten = deGiay.getTen().trim();
        Optional<DeGiay> existing = deGiayRepo.findByTen(ten);

        if (ten.isEmpty()) {
            throw new Exception("Không được để trống");
        }

        if (existing.isPresent()) {
            throw new Exception("Đế giày đã tồn tại");
        }

        deGiayRepo.save(deGiay);
        return deGiay;
    }


    public void suaDeGiay(DeGiay deGiay) {
        deGiayRepo.save(deGiay);
    }

    public boolean existsByName(String ten) {
        return deGiayRepo.existsByTen(ten);
    }

    public DeGiay findById(Integer id) {
        return deGiayRepo.findById(id).orElse(null);
    }
}