package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.MauSac;
import com.example.dev.repository.attribute.MauSacRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class MauSacService {
    @Autowired
    MauSacRepo mauSacRepo;

    public List<MauSac> getMs(){
        return mauSacRepo.findAll();
    }

    public List<MauSac> getMauSacBan(){
        return mauSacRepo.findAllByTrangThaiIsTrue();
    }

    public MauSac themMauSac(MauSac ms) throws Exception {
        MauSac check =  mauSacRepo.findMauSacByTenEqualsIgnoreCase(ms.getTen());
        if(check == null){
            mauSacRepo.save(ms);
            return ms;
        }else{
            throw new Exception("Màu sắc đã tồn tại");
        }
    }

    public void suaMauSac(MauSac ms){
        mauSacRepo.save(ms);
    }
}
