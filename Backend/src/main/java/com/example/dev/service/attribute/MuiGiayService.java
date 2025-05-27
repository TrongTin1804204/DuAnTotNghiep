package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.MuiGiay;
import com.example.dev.repository.attribute.MuiGiayRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MuiGiayService {
    @Autowired
    MuiGiayRepo muiGiayRepo;

    public List<MuiGiay> getMg(){
        return muiGiayRepo.findAll();
    }

    public List<MuiGiay> getMuiGiayBan(){
        return muiGiayRepo.findAllByTrangThaiIsTrue();
    }

    public MuiGiay themMuiGiay(MuiGiay mg) throws Exception {
        String ten = mg.getTen().trim();
        Optional<MuiGiay> existing = muiGiayRepo.findByTen(ten);

        if (ten.isEmpty()) {
            throw new Exception("Không được để trống");
        }

        if (existing.isPresent()) {
            throw new Exception("Mũi giày đã tồn tại");
        }

        muiGiayRepo.save(mg);
        return mg;
    }


    public void suaMuiGiay(MuiGiay mg){
        muiGiayRepo.save(mg);
    }
}
