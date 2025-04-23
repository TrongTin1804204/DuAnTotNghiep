import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import api from '../../../security/Axios';
import { useNavigate } from 'react-router-dom';
export default function AddressDialog({ open, onClose, selectedAddress }) {
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [tenNguoiNhan, setTenNguoiNhan] = useState('');
    const [diaChiChiTiet, setDiaChiChiTiet] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [ghiChu, setGhiChu] = useState('');

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const validateForm = () => {
        const newErrors = {};

        if (!tenNguoiNhan.trim()) {
            newErrors.tenNguoiNhan = "Tên người nhận không được để trống.";
        }

        if (!diaChiChiTiet.trim()) {
            newErrors.diaChiChiTiet = "Địa chỉ chi tiết không được để trống.";
        }
        if (!soDienThoai.trim()) {
            newErrors.soDienThoai = "Số điện thoại không được để trống.";
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(soDienThoai)) {
            newErrors.soDienThoai = "Số điện thoại phải gồm đúng 10 chữ số.";
        }

        if (!selectedProvince) {
            newErrors.province = "Vui lòng chọn Tỉnh/Thành phố.";
        }

        if (!selectedDistrict) {
            newErrors.district = "Vui lòng chọn Quận/Huyện.";
        }

        if (!selectedWard) {
            newErrors.ward = "Vui lòng chọn Xã/Phường.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fillData = () => {
        setDiaChiChiTiet(selectedAddress?.diaChiChiTiet.split(",")[0]);
        setTenNguoiNhan(selectedAddress?.tenNguoiNhan);
        setSoDienThoai(selectedAddress?.soDienThoai);
        setGhiChu(selectedAddress?.ghiChu);
        setSelectedProvince(selectedAddress?.thanhPho);
        setSelectedDistrict(selectedAddress?.quanHuyen);
        setSelectedWard(selectedAddress?.xaPhuong);
    }
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await api.get(
                    "/admin/dia-chi/get-province",
                );
                setProvinces(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tỉnh:", error);
            }
        };

        fetchProvinces();
        handleProvinceChange(selectedAddress?.thanhPho);
        handleDistrictChange(selectedAddress?.quanHuyen);
        handleWardChange(selectedAddress?.xaPhuong);
        fillData();
    }, [open]);

    const handleProvinceChange = async (provinceId) => {
        try {
            if (provinceId) {
                setSelectedProvince(provinceId);
                setDistricts([]);
                setWards([]);
                setSelectedDistrict(null);
                setSelectedWard(null);
                const response = await api.get(
                    "/admin/dia-chi/get-districts",
                    { params: { provinceID: provinceId } }
                );
                setDistricts(response.data.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách district:", error);
        }
    };

    const handleDistrictChange = async (districtId) => {
        if (districtId) {
            setSelectedDistrict(districtId);
            setWards([]);
            setSelectedWard(null);
            try {
                const response = await api.get(
                    "/admin/dia-chi/get-wards",
                    { params: { districtID: districtId } }
                );
                setWards(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách ward:", error);
            }
        }
    };

    const handleWardChange = (ward) => {
        setSelectedWard(ward);
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const data = {
            id: selectedAddress?.id,
            khachHang: selectedAddress?.khachHang,
            tenNguoiNhan,
            soDienThoai,
            ghiChu,
            diaChiChiTiet,
            thanhPho: selectedProvince,
            quanHuyen: selectedDistrict,
            xaPhuong: selectedWard,
        };
        console.log(data);

        api.post(`/admin/dia-chi/update-address/-1`, data)
            .then(response => {
                if (response.status === 200) {
                    onClose(true);
                }
            })
            .catch(error => {
                console.error('Lỗi khi gửi dữ liệu:', error);
            });

        // Close dialog after successful submission
    };


    return (
        <Dialog open={open} onClose={() => onClose(false)}>
            <DialogTitle>Sửa Địa Chỉ</DialogTitle>
            <DialogContent>
                <FormControl fullWidth error={Boolean(errors.province)}>
                    <InputLabel id="thanh-pho">Tỉnh/Thành phố</InputLabel>
                    <Select
                        value={selectedProvince || ""}
                        labelId="thanh-pho"
                        label="Tỉnh/Thành phố"
                        onChange={(e) => {
                            handleProvinceChange(e.target.value)
                            setErrors(prev => ({ ...prev, province: '' }));
                        }}
                    >
                        {provinces.map((p) => (
                            <MenuItem key={p.ProvinceID} value={p.ProvinceID}>
                                {p.ProvinceName}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.province && <p style={{ color: 'red', margin: 0, fontSize: 12 }}>{errors.province}</p>}
                </FormControl>


                <FormControl
                    fullWidth
                    disabled={!selectedProvince}
                    error={Boolean(errors.district)}
                >
                    <InputLabel id="huyen">Quận/Huyện</InputLabel>
                    <Select
                        labelId="huyen"
                        label="Quận/Huyện"
                        value={selectedDistrict || ""}
                        onChange={(e) => {
                            handleDistrictChange(e.target.value)
                            setErrors(prev => ({ ...prev, district: '' }));
                        }}
                    >
                        {districts.map((d) => (
                            <MenuItem key={d.DistrictID} value={d.DistrictID}>
                                {d.DistrictName}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.district && (
                        <p style={{ color: 'red', margin: 0, fontSize: 12 }}>
                            {errors.district}
                        </p>
                    )}
                </FormControl>


                <FormControl
                    fullWidth
                    disabled={!selectedDistrict}
                    error={Boolean(errors.ward)}
                >
                    <InputLabel id="xa">Xã/Phường</InputLabel>
                    <Select
                        value={selectedWard || ""}
                        onChange={(e) => {
                            handleWardChange(e.target.value)
                            setErrors(prev => ({ ...prev, ward: '' }));
                        }}
                        labelId="xa"
                        label="Xã/Phường"
                    >
                        {wards.map((w) => (
                            <MenuItem key={w.WardCode} value={w.WardCode}>
                                {w.WardName}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.ward && (
                        <p style={{ color: 'red', margin: 0, fontSize: 12 }}>
                            {errors.ward}
                        </p>
                    )}
                </FormControl>

                <TextField
                    label="Địa chỉ chi tiết"
                    fullWidth
                    value={diaChiChiTiet}
                    onChange={(e) => {
                        setDiaChiChiTiet(e.target.value);
                        setErrors(prev => ({ ...prev, diaChiChiTiet: '' }));
                    }}
                    margin="normal"
                    error={Boolean(errors.diaChiChiTiet)}
                    helperText={errors.diaChiChiTiet}
                />

                <TextField
                    label="Tên người nhận"
                    fullWidth
                    value={tenNguoiNhan || ""}
                    margin="normal"
                    error={Boolean(errors.tenNguoiNhan)}
                    helperText={errors.tenNguoiNhan}
                    onChange={(e) => {
                        setTenNguoiNhan(e.target.value);
                        setErrors(prev => ({ ...prev, tenNguoiNhan: '' }));
                    }}

                />


                <TextField
                    label="Số điện thoại"
                    fullWidth
                    value={soDienThoai || ""}
                    onChange={(e) => {
                        setSoDienThoai(e.target.value);
                        setErrors(prev => ({ ...prev, soDienThoai: '' }));
                    }}
                    margin="normal"
                    error={Boolean(errors.soDienThoai)}
                    helperText={errors.soDienThoai}
                />

                <TextField
                    label="Ghi chú"
                    fullWidth
                    value={ghiChu || ""}
                    onChange={(e) => setGhiChu(e.target.value)}
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)} color="primary">Hủy</Button>
                <Button onClick={handleSave} color="primary">Lưu</Button>
            </DialogActions>
        </Dialog>
    )
}
