package com.example.dev.service;

import com.example.dev.mapper.SendMailMapper;
import org.springframework.stereotype.Service;


public interface ISendMailService {
    void sendMail(SendMailMapper sendMailMapper);
    int sendMailWithAttachment(SendMailMapper sendMailMapper);
}
