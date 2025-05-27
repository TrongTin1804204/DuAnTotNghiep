package com.example.dev.service.attribute;

import com.example.dev.entity.attribute.ChatLieu;
import com.example.dev.repository.attribute.ChatLieuRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatLieuService {
    @Autowired
    ChatLieuRepo chatLieuRepo;

    public List<ChatLieu> getChatLieu(){
        return chatLieuRepo.findAll();
    }

    public List<ChatLieu> getChatLieuBan(){
        return chatLieuRepo.findAllByTrangThaiIsTrue();
    }

    public ChatLieu themChatLieu(ChatLieu cl) throws Exception {
        String ten = cl.getTen().trim();
        Optional<ChatLieu> c = chatLieuRepo.findByTen(ten);
        if (cl.getTen().isEmpty()){
            throw new Exception("Không được để trống");
        }
        if (c.isPresent()) {
            throw new Exception("Chất liệu đã tồn tại");
        }
        chatLieuRepo.save(cl);

        return cl;
    }

    public void suaChatLieu(ChatLieu cl){
        chatLieuRepo.save(cl);
    }
}
