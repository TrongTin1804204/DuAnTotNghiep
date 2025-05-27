package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.CoGiay;
import com.example.dev.repository.attribute.CoGiayRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

@Service

public class CoGiayService {
    @Autowired
    CoGiayRepo coGiayRepo;

    public List<CoGiay> getCoGiay() {
        return coGiayRepo.findAll(Sort.by(Sort.Direction.DESC, "idCoGiay"));
    }

    public List<CoGiay> getCoGiays(String ten, Boolean trangThai) {
        if (ten != null && !ten.isEmpty() && trangThai != null) {
            return coGiayRepo.findByTenAndTrangThai(ten, trangThai);
        } else if (ten != null && !ten.isEmpty()) {
            return coGiayRepo.findAllByTen(ten);
        } else if (trangThai != null) {
            return coGiayRepo.findByTrangThai(trangThai);
        } else {
            return getCoGiay();
        }
    }

    public List<CoGiay> getCoGiayBan(){
        return coGiayRepo.findAllByTrangThaiIsTrue();
    }
//    public List<CoGiay> themCoGiay(CoGiay cg){
//        coGiayRepo.save(cg);
//        return getCoGiay();
//    }

    public boolean existsByName(String ten) {
        return coGiayRepo.findByTen(ten).isPresent();
    }

    public CoGiay themCoGiay(CoGiay cg) throws Exception {
        String ten = cg.getTen().trim();
        Optional<CoGiay> existing = coGiayRepo.findByTen(ten);

        if (ten.isEmpty()) {
            throw new Exception("Không được để trống");
        }

        if (existing.isPresent()) {
            throw new Exception("Cổ giày đã tồn tại");
        }

        coGiayRepo.save(cg);
        return cg;
    }


    public void suaCoGiay(CoGiay cg){
        coGiayRepo.save(cg);
    }

    public CoGiay findById(Integer id) {
        return coGiayRepo.findById(id).orElse(null);
    }
}