package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.NhaCungCap;
import com.example.dev.repository.attribute.NhaCungCapRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhaCungCapService {
    @Autowired
    NhaCungCapRepo nhaCungCapRepo;

    public List<NhaCungCap> getNcc(){
        return nhaCungCapRepo.findAll();
    }

    public List<NhaCungCap> getNhaCungCapBan(){
        return nhaCungCapRepo.findAllByTrangThaiIsTrue();
    }
    public NhaCungCap themNhaCungCap(NhaCungCap ncc) throws Exception {
        String ten = ncc.getTen().trim();
        Optional<NhaCungCap> existing = nhaCungCapRepo.findByTen(ten);

        if (ten.isEmpty()) {
            throw new Exception("Không được để trống");
        }

        if (existing.isPresent()) {
            throw new Exception("Nhà cung cấp đã tồn tại");
        }

        nhaCungCapRepo.save(ncc);
        return ncc;
    }


    public void suaNhaCungCap(NhaCungCap ncc){
        nhaCungCapRepo.save(ncc);
    }
}
