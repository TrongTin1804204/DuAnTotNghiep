package com.example.dev.service.attribute;

import com.example.dev.DTO.UserLogin.UserLogin;
import com.example.dev.DTO.request.SearchRequest.SearchRequest;
import com.example.dev.DTO.response.SearchResponse.SearchResponse;
import com.example.dev.DTO.response.product.SanPhamDTO;
import com.example.dev.DTO.response.product.SanPhamOnlResponse;
import com.example.dev.entity.attribute.SanPham;
import com.example.dev.repository.attribute.SanPhamRepo;
import com.example.dev.util.Page.GeneratePageable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class SanPhamService {
    @Autowired
    SanPhamRepo sanPhamRepo;

    public List<SanPhamDTO> getSpDTO(String keyword){
        return sanPhamRepo.getAll(keyword);
    }

//    public SearchResponse getSpDTO(SearchRequest request){
//        Pageable pageable = GeneratePageable.createPageable(request.getPage(),request.getSize(),request.getSortBy(),request.getSortOrder());
//        log.info("{}",request);
//        Page<?> page = sanPhamRepo.getAll(request.getKeyword(), pageable);
//
//        return SearchResponse.builder()
//                .results(page.getContent())
//                .size(request.getSize())
//                .page(request.getPage())
//                .totalPage(page.getTotalPages())
//                .hasPrevious(page.hasPrevious())
//                .hasNext(page.hasNext())
//                .build();
//    }
    public List<?> getSanPhamBan(){
        return sanPhamRepo.findAllByTrangThaiIsTrue();
    }

    public List<?> getProductOnl(){
        return sanPhamRepo.getListProductOnl();
    }

    @Transactional
    public SanPham themSanPham(SanPham sanPham,Authentication authentication) {
        sanPham.setNgayTao(LocalDateTime.now());
        UserLogin userLogin = (UserLogin) authentication.getPrincipal();
        sanPham.setNguoiTao(userLogin.getUsername());
        SanPham savedProduct = sanPhamRepo.save(sanPham);
        savedProduct.setMaSanPham(String.format("P-%07d", savedProduct.getIdSanPham()));
        sanPhamRepo.save(savedProduct);
        return savedProduct;
    }

    public void suaSanPham(SanPham sanPham,Authentication authentication) {
        UserLogin userLogin = (UserLogin) authentication.getPrincipal();
        sanPham.setNguoiSua(userLogin.getUsername());
        sanPhamRepo.save(sanPham);
    }


}
