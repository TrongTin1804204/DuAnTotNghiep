package com.example.dev.service;

import com.cloudinary.Cloudinary;
import com.example.dev.DTO.response.CloudinaryResponse;
import com.example.dev.entity.HinhAnh;
import com.example.dev.exception.FuncErrorException;
import com.example.dev.repository.HinhAnhRepo;
import com.example.dev.repository.customer.KhachHangRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private HinhAnhRepo hinhAnhRepo;
    @Autowired
    private KhachHangRepo khachHangRepo;

    @Transactional
    public CloudinaryResponse uploadFileByte(final byte[] file, final String fileName, String colorName, Integer idSanPham) {
        try {
            final Map result = this.cloudinary.uploader().upload(file, Map.of("public_id", "cenndiii_shop/" + idSanPham + "/" + colorName.substring(1, 7) + "/" + fileName));
            final String url = (String) result.get("secure_url");
            final String publicId = (String) result.get("public_id");
            return CloudinaryResponse.builder().publicId(publicId).url(url).build();

        } catch (final Exception e) {
            System.out.println(e.getMessage());
            throw new FuncErrorException("Không thêm ảnh được!");
        }
    }

    @Transactional
    public CloudinaryResponse uploadFile(final MultipartFile file, final String fileName, String colorName, Integer idSanPham) {
        try {
            final Map result = this.cloudinary.uploader().upload(file.getBytes(), Map.of("public_id", "cenndiii_shop/" + idSanPham + "/" + colorName.substring(1, 7) + "/" + fileName));
            final String url = (String) result.get("secure_url");
            final String publicId = (String) result.get("public_id");
            return CloudinaryResponse.builder().publicId(publicId).url(url).build();

        } catch (final Exception e) {
            throw new FuncErrorException(e.getMessage());
        }
    }

    public void deleteImageProductDetail(final String publicUrl) {
        try {
            // Trích xuất public_id từ URL
            String publicId = extractPublicIdFromUrl(publicUrl);

            // Gọi API destroy với public_id đã trích xuất
            Map result = this.cloudinary.uploader().destroy(publicId, Map.of());
            HinhAnh ha = hinhAnhRepo.findHinhAnhByLienKet(publicUrl);
            hinhAnhRepo.delete(ha);
            if (!"ok".equals(result.get("result"))) {
                throw new FuncErrorException("Xóa ảnh thất bại: " + result.get("result"));
            }
        } catch (final Exception e) {
            throw new FuncErrorException("Không thể xóa ảnh: " + e.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String url) {
        try {
            // Tìm vị trí của "/upload/" trong URL
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                throw new IllegalArgumentException("URL không hợp lệ");
            }

            // Lấy phần sau "/upload/vXXXXXXXXX/"
            String path = url.substring(uploadIndex + "/upload/".length());
            // Bỏ qua phiên bản (vXXXXXXXXX/)
            if (path.startsWith("v") && path.indexOf("/") > 0) {
                path = path.substring(path.indexOf("/") + 1);
            }

            // Loại bỏ phần mở rộng file cuối cùng (nếu có)
            if (path.lastIndexOf(".") > 0) {
                path = path.substring(0, path.lastIndexOf("."));
            }

            // Giải mã URL để xử lý các ký tự đặc biệt như %20
            return java.net.URLDecoder.decode(path, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi trích xuất public_id từ URL: " + e.getMessage());
        }
    }

}
