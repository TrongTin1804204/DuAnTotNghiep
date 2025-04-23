package com.example.dev.service.customer;

import com.example.dev.DTO.response.CloudinaryResponse;
import com.example.dev.DTO.response.customer.KhachHangResponse;
import com.example.dev.constant.BaseConstant;
import com.example.dev.entity.customer.DiaChi;
import com.example.dev.entity.customer.KhachHang;
import com.example.dev.mapper.AddressMapper;
import com.example.dev.mapper.CustomerMapper;
import com.example.dev.mapper.SendMailMapper;
import com.example.dev.model.DistrictModel;
import com.example.dev.model.ProvinceModel;
import com.example.dev.model.WardModel;
import com.example.dev.repository.customer.DiaChiRepo;
import com.example.dev.repository.customer.KhachHangRepo;
import com.example.dev.service.CloudinaryService;
import com.example.dev.service.ISendMailService;
import com.example.dev.util.FileUpLoadUtil;
import com.example.dev.util.IUtil;
import com.example.dev.util.baseModel.BaseListResponse;
import com.example.dev.util.baseModel.BaseResponse;
import com.example.dev.validator.KhachHangValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
public class KhachHangService {

    @Autowired
    private KhachHangRepo khachHangRepo;
    @Autowired
    private DiaChiRepo diaChiRepo;
    @Autowired
    private KhachHangValidator khachHangValidator;
    @Autowired
    private IUtil iUtil;
    @Autowired
    private ISendMailService sendMailService;
    @Autowired
    private IProvinceService provinceService;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String UPLOAD_DIR = "src/main/resources/static/uploads/";

    public List<KhachHang> getAllCustomerIsStatusTrue() {
        return khachHangRepo.findByTrangThaiIsTrue();
    }

//    public List<KhachHang> getAll() {
//        return khachHangRepo.findAll();
//    }

    public KhachHang themKhachHang(KhachHang khachHang) {
        String password = iUtil.generatePassword();
        khachHang.setMatKhau(passwordEncoder.encode(password));
        SendMailMapper sendMailMapper = new SendMailMapper();
        sendMailMapper.setToMail(khachHang.getEmail());
        sendMailMapper.setSubject("Notice: Register successfully");
        sendMailMapper.setContent("Welcome to CenciddiShop. Your account: " + khachHang.getSoDienThoai() + " , password: " + password + ". Let login and try with special experience");
        sendMailService.sendMail(sendMailMapper);
        return khachHangRepo.save(khachHang);
    }

    @Transactional
    public BaseResponse<Integer> themKhachHang(String userJson, MultipartFile file) {
        BaseResponse<Integer> response = new BaseResponse<>();
        KhachHang khachHang = new KhachHang();
        CustomerMapper model = new CustomerMapper();
        try {
            ObjectMapper mapper = new ObjectMapper();
            model = mapper.readValue(userJson, CustomerMapper.class);
            khachHang.setMaKhachHang(model.getMaKhachHang());
            khachHang.setHoTen(model.getHoTen());
            khachHang.setEmail(model.getEmail());
            khachHang.setTrangThai(model.isTrangThai());
            khachHang.setGioiTinh(model.isGioiTinh());
            khachHang.setSoDienThoai(model.getSoDienThoai());
            String password = iUtil.generatePassword();
            khachHang.setMatKhau(password);
            khachHangValidator.validateKhachHang(khachHang, null);
        } catch (Exception e) {
            response.setFailResponse(e.getMessage(), null);
            return response;
        }
        Optional<KhachHang> existingPhone = khachHangRepo.findBySoDienThoai(khachHang.getSoDienThoai());
        if (existingPhone.isPresent()) {
            response.setFailResponse("Số điện thoại đã tồn tại", null);
            return response;
        }
        Optional<KhachHang> existingMa = khachHangRepo.findByMaKhachHang(khachHang.getMaKhachHang());
        if (existingMa.isPresent()) {
            response.setFailResponse("Mã khách hàng đã tồn tại", null);
            return response;
        }
        Optional<KhachHang> existingEmail = khachHangRepo.findByEmail(khachHang.getEmail());
        if (existingEmail.isPresent()) {
            response.setFailResponse("Email đã tồn tại", null);
            return response;
        }
        if (file.isEmpty()) {
            response.setFailResponse("File image is empty", null);
            return response;
        }
        try {
            final String fileName = FileUpLoadUtil.getFileName(file.getOriginalFilename());
            FileUpLoadUtil.assertAllowed(file, FileUpLoadUtil.IMAGE_PATTERN);
            final CloudinaryResponse cloudinaryResponse = this.cloudinaryService.uploadFile(file, fileName, khachHang.getMaKhachHang(), 1);
            khachHang.setHinhAnh(cloudinaryResponse.getUrl());
        } catch (Exception e) {
            e.printStackTrace();
            response.setFailResponse(e.getMessage(), null);
            return response;
        }

        KhachHang modelSave = khachHangRepo.save(khachHang);
        if (modelSave.getIdKhachHang() != null) {
            DiaChi diaChi = new DiaChi();
            diaChi.setDiaChiChiTiet(model.getFullInfo());
            diaChi.setThanhPho(model.getProvinceId());
            diaChi.setQuanHuyen(model.getDistrictId());
            diaChi.setXaPhuong(String.valueOf(model.getWardId()));
            diaChi.setSoDienThoai(model.getSoDienThoai());
//            diaChi.setIdKhachHang(modelSave.getIdKhachHang());
            diaChi.setTenNguoiNhan(model.getHoTen());
            diaChi.setMacDinh(true);
            diaChi.setStage(1);
            diaChiRepo.saveAndFlush(diaChi);

            SendMailMapper sendMailMapper = new SendMailMapper();
            sendMailMapper.setToMail(khachHang.getEmail());
            sendMailMapper.setSubject("Notice: Register successfully");
            sendMailMapper.setContent("Welcome to CenciddiShop. Your account: " + khachHang.getEmail() + " , password: " + khachHang.getMatKhau() + ". Let login and try with special experience");
            sendMailService.sendMail(sendMailMapper);
        }
        response.setSuccessResponse("Insert successful", modelSave.getIdKhachHang());
        return response;
    }

//    @Transactional
//    public BaseResponse<KhachHang> suaKhachHang(CustomerMapper model) {
//        BaseResponse<KhachHang> baseResponse = new BaseResponse<>();
//
//        KhachHang khachHang = new KhachHang();
//
//        KhachHang existing = khachHangRepo.findByMaKhachHang(model.getMaKhachHang())
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
//        khachHang = model.toKhachHang();
//
//        try {
//            khachHangValidator.validateKhachHang(khachHang, model.getId()); // Passing existing customer id for update
//        } catch (Exception e) {
//            baseResponse.setFailResponse(e.getMessage(), null);
//            return baseResponse;
//        }
//
//        if (model.getImageBase64() != null && !model.getImageBase64().isEmpty()) {
//            LocalDateTime localDateTime = LocalDateTime.now();
//            String outputFilePath = localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() + existing.getIdKhachHang() + "portrait.png";
//            String base64String = model.getImageBase64().split("base64,")[1];
//            byte[] imageBytes = Base64.getDecoder().decode(base64String);
//            try {
//                final String fileName = FileUpLoadUtil.getFileName(outputFilePath);
//                final CloudinaryResponse cloudinaryResponse = this.cloudinaryService.uploadFileByte(imageBytes, fileName, khachHang.getMaKhachHang(), 1);
//                existing.setHinhAnh(cloudinaryResponse.getUrl());
//            } catch (Exception e) {
//                e.printStackTrace();
//                baseResponse.setFailResponse(e.getMessage(), null);
//                return baseResponse;
//            }
//        }
//
//        existing.setHoTen(model.getHoTen());
//        existing.setGioiTinh(model.isGioiTinh());
//        existing.setSoDienThoai(model.getSoDienThoai());
//        KhachHang modelSave = khachHangRepo.saveAndFlush(existing);
//        if (modelSave.getIdKhachHang() != null) {
//            baseResponse.setSuccessResponse("Information customer updated", modelSave);
//        }
//        if (modelSave.getIdKhachHang() != null) {
//            List<DiaChi> diaChis = new ArrayList<>();
////            if (!model.getAddressMappers().isEmpty()) {
////                List<Integer> diaChiIds = model.getAddressMappers().stream().map(AddressMapper::getId).filter(eId -> eId != 0).toList();
////                diaChiRepo.deleteAllById(diaChiIds);
////                diaChiRepo.flush();
////                diaChis = model.getAddressMappers().stream().filter(e -> e.getStage() == 1).map(e -> new DiaChi(null, e.getCustomerId() == 0 ? model.getId() : e.getCustomerId(), e.getNameReceive(), e.getPhoneNumber(), e.getProvinceId(),
////                        e.getDistrictId(), e.getWardId(), e.getFullInfo(), e.getNote(), e.isStatus(), 1)).toList();
////                diaChiRepo.saveAllAndFlush(diaChis);
////            }
//        }
//
//        return baseResponse;
//    }

    @Transactional
    public BaseResponse<CustomerMapper> updateAddress(CustomerMapper model) {
        BaseResponse<CustomerMapper> baseResponse = new BaseResponse<>();
        List<DiaChi> diaChis = new ArrayList<>();
        if (!model.getAddressMappers().isEmpty()) {
            List<Integer> diaChiIds = model.getAddressMappers().stream().map(AddressMapper::getId).filter(eId -> eId != 0).toList();
            diaChiRepo.deleteAllById(diaChiIds);
            diaChiRepo.flush();
//            diaChis = model.getAddressMappers().stream().filter(e -> e.getStage() == 1).map(e -> new DiaChi(null, e.getCustomerId() == 0 ? model.getId() : e.getCustomerId(), e.getNameReceive(), e.getPhoneNumber(), e.getProvinceId(),
//                    e.getDistrictId(), e.getWardId(), e.getAddressDetail(), e.getNote(), e.isStatus(), 1)).toList();
//            diaChiRepo.saveAndFlush(diaChis.get(0));
        }
        baseResponse.setSuccessResponse("Update Success", model);
        return baseResponse;
    }

    @Transactional
    public void xoaKhachHang(Integer id) {
        KhachHang kh = khachHangRepo.findById(id).orElseThrow();
        kh.setTrangThai(false);
        khachHangRepo.saveAndFlush(kh);
    }

    public CustomerMapper detailKhachHang(Integer id) {
        Optional<KhachHang> model = khachHangRepo.findById(id);
        CustomerMapper customerMapper = new CustomerMapper();
        if (model.isPresent()) {
            KhachHang modelPresent = model.get();
            customerMapper = new CustomerMapper();
            customerMapper.setId(modelPresent.getIdKhachHang());
            customerMapper.setMaKhachHang(modelPresent.getMaKhachHang());
            customerMapper.setSoDienThoai(modelPresent.getSoDienThoai());
            customerMapper.setTrangThai(modelPresent.getTrangThai());
            customerMapper.setGioiTinh(modelPresent.getGioiTinh());
            customerMapper.setHoTen(modelPresent.getHoTen());
            customerMapper.setEmail(modelPresent.getEmail());
            customerMapper.setImage(modelPresent.getHinhAnh());

            List<DiaChi> diaChis = diaChiRepo.findByKhachHang_IdKhachHang(modelPresent.getIdKhachHang());

            List<AddressMapper> addressMappers = new ArrayList<>();
//            if (!diaChis.isEmpty()) {
//                for (DiaChi e : diaChis) {
//                    ProvinceModel provinceModel = provinceService.getProvinceModel(Integer.parseInt(e.getThanhPho()));
//                    AddressMapper addressMapper = new AddressMapper(e.getQuanHuyen(),
//                            e.getId(),
//                            e.getIdKhachHang(),
//                            e.getTenNguoiNhan(),
//                            e.getSoDienThoai(),
//                            e.getThanhPho(),
//                            e.getXaPhuong(),
//                            e.getDiaChiChiTiet(),
//                            e.getGhiChu(),
//                            e.isMacDinh(),
//                            provinceModel.getName(),
//                            provinceModel.getDistricts().stream().filter(p -> p.getCode() == Integer.parseInt(e.getQuanHuyen())).findFirst().map(DistrictModel::getName).orElse(null),
//                            provinceModel.getDistricts().stream().filter(p -> p.getCode() == Integer.parseInt(e.getQuanHuyen())).findFirst().orElse(null).
//                                    getWards().stream().filter(p -> p.getCode() == Integer.parseInt(e.getXaPhuong())).findFirst().map(WardModel::getName).orElse(null),
//                            e.getStage());
//                    addressMappers.add(addressMapper);
//                }
//
//                customerMapper.setAddressMappers(addressMappers);
//            }
        }
        return customerMapper;
    }


    public BaseListResponse<CustomerMapper> timKiem(String keyword, Boolean gioiTinh, Boolean trangThai, String soDienThoai, Pageable pageable) {

        Page<KhachHang> models = khachHangRepo.timKiem(keyword, gioiTinh, trangThai, soDienThoai, pageable);
        BaseListResponse<CustomerMapper> response = new BaseListResponse<>();
        List<KhachHang> customerList = models.getContent();
        List<Integer> customerIds = customerList.stream().map(KhachHang::getIdKhachHang).toList();
        List<CustomerMapper> customerMappers = new ArrayList<>();
        List<DiaChi> addressModelCustoms = new ArrayList<>();
        try {
            addressModelCustoms = diaChiRepo.getByCustomerId(customerIds);
        } catch (Exception e) {
            e.printStackTrace();
        }
        for (KhachHang e : customerList) {
            CustomerMapper customerMapperModel = e.toKhachHang();
            addressModelCustoms.stream().filter(address -> Objects.equals(address.getKhachHang().getIdKhachHang(), e.getIdKhachHang())).findFirst().
                    ifPresent(model -> customerMapperModel.setAddressDetails(model.getDiaChiChiTiet()));
            customerMappers.add(customerMapperModel);
        }
        response.setTotalCount(models.getTotalPages());
        response.setSuccessResponse("Success", customerMappers);
        return response;
    }


    // tín thêm

    @Transactional
    public DiaChi updateSelectedAddress(AddressMapper addressMapper) {
        return diaChiRepo.findById(addressMapper.getId())
                .map(diaChi -> {
                    diaChi.setTenNguoiNhan(addressMapper.getNameReceive());
                    diaChi.setSoDienThoai(addressMapper.getPhoneNumber());
                    diaChi.setThanhPho(Integer.getInteger(addressMapper.getProvinceId()));
                    diaChi.setQuanHuyen(Integer.getInteger(addressMapper.getDistrictId()));
                    diaChi.setXaPhuong(addressMapper.getWardId());
                    diaChi.setDiaChiChiTiet(addressMapper.getAddressDetail());
                    diaChi.setGhiChu(addressMapper.getNote());
                    diaChi.setMacDinh(addressMapper.isStatus());

                    return diaChiRepo.save(diaChi);
                })
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ!"));
    }

    @Transactional
    public KhachHang updateDirectAddress(AddressMapper addressMapper) {
        // Nếu không có ID địa chỉ, cập nhật trực tiếp vào khách hàng
        KhachHang khachHang = khachHangRepo.findById(addressMapper.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng!"));

        khachHang.setHoTen(addressMapper.getNameReceive());
        khachHang.setSoDienThoai(addressMapper.getPhoneNumber());

        // Gộp địa chỉ đầy đủ thành 1 chuỗi

        khachHang.setDiaChi(addressMapper.getAddressId());

        return khachHangRepo.save(khachHang);
    }

    public DiaChi themDiaChi(AddressMapper addressMapper) {
        DiaChi diaChi = new DiaChi();
//        diaChi.setIdKhachHang(addressMapper.getCustomerId());
        diaChi.setTenNguoiNhan(addressMapper.getNameReceive());
        diaChi.setSoDienThoai(addressMapper.getPhoneNumber());
//        diaChi.setThanhPho(addressMapper.getProvinceId());
//        diaChi.setQuanHuyen(addressMapper.getDistrictId());
        diaChi.setXaPhuong(addressMapper.getWardId());
        diaChi.setDiaChiChiTiet(addressMapper.getAddressDetail());
        diaChi.setGhiChu(addressMapper.getNote());
        diaChi.setMacDinh(addressMapper.isStatus());
        diaChi.setStage(addressMapper.getStage());
        return diaChiRepo.save(diaChi);
    }

    // _____________________________________
    public List<KhachHang> getAll() {
        return khachHangRepo.findAll();
    }

    public KhachHang getDetail(Integer idKhachHang){
        return khachHangRepo.findById(idKhachHang).orElseThrow();
    }
    public List<?> getAllKh(){
        return khachHangRepo.getAllKh();
    }
    public List<DiaChi> getCustomerAddress(Integer idKhachHang) {
        return diaChiRepo.findByKhachHang_IdKhachHang(idKhachHang);
    }

    public BaseResponse<?> addNewCustomer(KhachHangResponse khachHangResponse,MultipartFile file){
        try {
            BaseResponse<?> response = new BaseResponse<>();
            final String fileName = FileUpLoadUtil.getFileName(file.getOriginalFilename());

            Optional<KhachHang> existingPhone = khachHangRepo.findBySoDienThoai(khachHangResponse.getSoDienThoai());
            if (existingPhone.isPresent()) {
                response.setMessage("Số điện thoại đã tồn tại");
                response.setCode(BaseConstant.CustomResponseCode.ERROR.getCode());
                return response;
            }
            Optional<KhachHang> existingMa = khachHangRepo.findByMaKhachHang(khachHangResponse.getMaKhachHang());
            if (existingMa.isPresent()) {
                response.setMessage("Mã khách hàng đã tồn tại");
                response.setCode(BaseConstant.CustomResponseCode.ERROR.getCode());
                return response;
            }
            Optional<KhachHang> existingEmail = khachHangRepo.findByEmail(khachHangResponse.getEmail());
            if (existingEmail.isPresent()) {
                response.setCode(BaseConstant.CustomResponseCode.ERROR.getCode());
                response.setMessage("Email đã tồn tại");
                return response;
            }
            String password = iUtil.generatePassword();
            DiaChi diaChi = new DiaChi();
            KhachHang khachHang = new KhachHang();
            String fullAddress =
                    khachHangResponse.getAddressDetails() + ", "
                    +khachHangResponse.getWardName() +", "
                    +khachHangResponse.getDistrictName() +", "
                    +khachHangResponse.getProvinceName() +", ";
            khachHang.setTrangThai(true);
            khachHang.setMaKhachHang(khachHangResponse.getMaKhachHang());
            khachHang.setHoTen(khachHangResponse.getHoTen());
            khachHang.setSoDienThoai(khachHangResponse.getSoDienThoai());
            khachHang.setGioiTinh(khachHangResponse.getGioiTinh());
            khachHang.setEmail(khachHangResponse.getEmail());
            khachHang.setMatKhau(passwordEncoder.encode(password));

            FileUpLoadUtil.assertAllowed(file, FileUpLoadUtil.IMAGE_PATTERN);
            final CloudinaryResponse cloudinaryResponse = this.cloudinaryService.uploadFile(file, fileName, "Khachhangtest", 1);
            khachHang.setHinhAnh(cloudinaryResponse.getUrl());
            KhachHang  newKh =  khachHangRepo.save(khachHang);

            diaChi.setThanhPho(khachHangResponse.getProvinceId());
            diaChi.setQuanHuyen(khachHangResponse.getDistrictId());
            diaChi.setXaPhuong(khachHangResponse.getWardId());
            diaChi.setDiaChiChiTiet(fullAddress);
            diaChi.setKhachHang(newKh);
            diaChi.setTenNguoiNhan(khachHangResponse.getHoTen());
            diaChi.setSoDienThoai(khachHangResponse.getSoDienThoai());
            diaChi.setMacDinh(true);
            diaChiRepo.save(diaChi);

            SendMailMapper sendMailMapper = new SendMailMapper();
            sendMailMapper.setToMail(khachHang.getEmail());
            sendMailMapper.setSubject("Notice: Register successfully");
            sendMailMapper.setContent("Welcome to CenndiiiShop. Your account: " + khachHang.getEmail() + " , password: " + password + ". Let login and try with special experience");
            sendMailService.sendMail(sendMailMapper);
            return BaseResponse.builder().code(BaseConstant.CustomResponseCode.SUCCESS.getCode()).message("Thêm thành công").build();
        } catch (Exception e) {
            return BaseResponse.builder().code(BaseConstant.CustomResponseCode.ERROR.getCode()).message(e.getMessage()).build();
        }
    }

    public BaseResponse<?> suaKhachHang(KhachHang khachHang,MultipartFile file) {
        try {
            KhachHang kh = khachHangRepo.findById(khachHang.getIdKhachHang()).orElseThrow();
            BaseResponse baseResponse = new BaseResponse();
            if (!khachHang.getHinhAnh().isEmpty()){
                if (file != null){
                    final String fileName = FileUpLoadUtil.getFileName(file.getOriginalFilename());
                    FileUpLoadUtil.assertAllowed(file, FileUpLoadUtil.IMAGE_PATTERN);
                    final CloudinaryResponse cloudinaryResponse = this.cloudinaryService.uploadFile(file, fileName, "Khachhangtest", 1);
                    khachHang.setHinhAnh(cloudinaryResponse.getUrl());
                }
            }

            khachHang.setMatKhau(kh.getMatKhau());
            khachHang.setMaKhachHang(kh.getMaKhachHang());
            khachHangRepo.save(khachHang);
            baseResponse.setCode(BaseConstant.CustomResponseCode.SUCCESS.getCode());
            baseResponse.setMessage(BaseConstant.CustomResponseCode.SUCCESS.getMessage());
            return baseResponse;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return BaseResponse.builder().code(BaseConstant.CustomResponseCode.ERROR.getCode()).message(e.getMessage()).build();
        }
    }

}
