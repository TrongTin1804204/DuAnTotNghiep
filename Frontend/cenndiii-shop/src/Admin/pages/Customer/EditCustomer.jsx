import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Grid,
    Paper,
    CircularProgress,
    Avatar,
    FormLabel,
    Container,
    Divider,
    IconButton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import api from "../../../security/Axios";
import AddressDialog from "../Order/AddCusstomerAddress";
import Notification from '../../../components/Notification';

const EditCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hoTen: '',
        soDienThoai: '',
        gioiTinh: '',
        email: '',
        hinhAnh: '',
        matKhau: '',
    });

    const [addressData, setAddressData] = useState({
        id: '',
        thanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: '',
        tenNguoiNhan: '',
        soDienThoai: '',
        ghiChu: '',
        khachHang: ''
    });

    const [address, setAddress] = useState([]);
    const [loadingState, setLoadingState] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(-1);

    // States cho địa chỉ hành chính
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // States for file handling
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchCustomerById();
        fetchProvinces();
        getCusAddress();
    }, [id]);

    const fetchCustomerById = async () => {
        setLoadingState(true);
        try {
            const response = await api.get(
                `admin/khach-hang/chi-tiet/${id}`
            );
            setFormData(response.data);
            setLoadingState(false);
        } catch (error) {
            setLoadingState(false);
            console.error("Error: ", error);
        }
    };

    const getCusAddress = async () => {
        setLoadingState(true);
        try {
            const response = await api.get(`/admin/dia-chi/get-address/${id}`);
            setAddress(response.data);

            const defaultAddress = response.data.find((item) => item.macDinh === true);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress.id);
                const diaChiChiTiet = defaultAddress.diaChiChiTiet?.split(",")[0];
                setAddressData({
                    id: defaultAddress.id || '',
                    thanhPho: defaultAddress.thanhPho || '',
                    quanHuyen: defaultAddress.quanHuyen || '',
                    xaPhuong: defaultAddress.xaPhuong || '',
                    diaChiChiTiet: diaChiChiTiet || '',
                    tenNguoiNhan: defaultAddress.tenNguoiNhan || '',
                    soDienThoai: defaultAddress.soDienThoai || '',
                    ghiChu: defaultAddress.ghiChu || '',
                    khachHang: defaultAddress.khachHang || '',
                });

                // Load province data first
                if (defaultAddress.thanhPho) {
                    setSelectedProvince(defaultAddress.thanhPho);
                    const districtResponse = await api.get("/admin/dia-chi/get-districts", {
                        params: { provinceID: defaultAddress.thanhPho }
                    });
                    setDistricts(districtResponse.data.data || []);

                    // Then load district data
                    if (defaultAddress.quanHuyen) {
                        setSelectedDistrict(defaultAddress.quanHuyen);
                        const wardResponse = await api.get("/admin/dia-chi/get-wards", {
                            params: { districtID: defaultAddress.quanHuyen }
                        });
                        setWards(wardResponse.data.data || []);

                        // Finally set ward
                        if (defaultAddress.xaPhuong) {
                            setSelectedWard(defaultAddress.xaPhuong);
                        }
                    }
                }
            } else {
                setSelectedAddress(-1);
            }
        } catch (error) {
            console.error("Error: ", error);
        } finally {
            setLoadingState(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await api.get("/admin/dia-chi/get-province");
            setProvinces(response.data.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tỉnh:", error);
        }
    };

    const handleProvinceChange = async (provinceId) => {
        try {
            if (provinceId) {
                setSelectedProvince(provinceId);
                setDistricts([]);
                setWards([]);
                setSelectedDistrict(null);
                setSelectedWard(null);

                // Cập nhật addressData
                setAddressData(prev => ({
                    ...prev,
                    thanhPho: provinceId,
                    quanHuyen: '',
                    xaPhuong: ''
                }));

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

            // Cập nhật addressData
            setAddressData(prev => ({
                ...prev,
                quanHuyen: districtId,
                xaPhuong: ''
            }));

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

    const handleWardChange = (wardId) => {
        setSelectedWard(wardId);
        setAddressData(prev => ({
            ...prev,
            xaPhuong: wardId
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddressDataChange = (e) => {
        const { name, value } = e.target;
        setAddressData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddressSelect = async (idDiaChi) => {
        setSelectedAddress(idDiaChi);
        const selectedAddr = address.find(addr => addr.id === idDiaChi);
        if (selectedAddr) {
            setSelectedAddress(selectedAddr.id);
            const diaChiChiTiet = selectedAddr.diaChiChiTiet?.split(",")[0];
            setAddressData({
                id: selectedAddr.id || '',
                thanhPho: selectedAddr.thanhPho || '',
                quanHuyen: selectedAddr.quanHuyen || '',
                xaPhuong: selectedAddr.xaPhuong || '',
                diaChiChiTiet: diaChiChiTiet || '',
                tenNguoiNhan: selectedAddr.tenNguoiNhan || '',
                soDienThoai: selectedAddr.soDienThoai || '',
                ghiChu: selectedAddr.ghiChu || '',
                khachHang: selectedAddr.khachHang || '',
            });

            // Load province data first
            if (selectedAddr.thanhPho) {
                setSelectedProvince(selectedAddr.thanhPho);
                const districtResponse = await api.get("/admin/dia-chi/get-districts", {
                    params: { provinceID: selectedAddr.thanhPho }
                });
                setDistricts(districtResponse.data.data || []);

                // Then load district data
                if (selectedAddr.quanHuyen) {
                    setSelectedDistrict(selectedAddr.quanHuyen);
                    const wardResponse = await api.get("/admin/dia-chi/get-wards", {
                        params: { districtID: selectedAddr.quanHuyen }
                    });
                    setWards(wardResponse.data.data || []);
                    if (selectedAddr.xaPhuong) {
                        setSelectedWard(selectedAddr.xaPhuong);
                    }
                }
            }
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Check if file is an image
            if (!selectedFile.type.startsWith('image/')) {
                Notification("Vui lòng chọn file ảnh", "error");
                return;
            }

            // Check file size (e.g., 5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                Notification("Kích thước file không được vượt quá 5MB", "error");
                return;
            }

            setFile(selectedFile);
            // Create preview URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingState(true);

        try {
            const formDataToSend = new FormData();

            if (file) {
                formDataToSend.append('fileImage', file);
            }

            // Convert form data to JSON string and append
            const customerData = {
                idKhachHang: id,
                hoTen: formData.hoTen,
                soDienThoai: formData.soDienThoai,
                gioiTinh: formData.gioiTinh,
                email: formData.email,
                trangThai: formData.trangThai,
                matKhau: formData.matKhau,
                hinhAnh: formData.hinhAnh,
            };

            formDataToSend.append('user', new Blob([JSON.stringify(customerData)], {
                type: 'application/json'
            }));
            const response = await api.post(
                `/admin/khach-hang/sua`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                Notification("Cập nhật thành công", "success");
                navigate('/admin/customers');
            }
        } catch (error) {
            console.error("Error updating customer:", error);
            Notification("Cập nhật thất bại", "error");
        } finally {
            setLoadingState(false);
        }
    };

    const handleUpdateAddress = async () => {
        if (selectedAddress === -1) return;
        setLoadingState(true);
        try {
            await api.post(`/admin/dia-chi/update-address/-1`, addressData);
            getCusAddress();
        } catch (error) {
            console.error("Error updating address:", error);
        } finally {
            setLoadingState(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (selectedAddress === -1) return;
        setLoadingState(true);
        try {
            await api.get(`/admin/dia-chi/delete/${selectedAddress}`);
            getCusAddress()
        } catch (error) {
            console.error("Error deleting address:", error);
        } finally {
            setLoadingState(false);
        }
    };

    const [openAddAddressDialog, setOpenAddAddressDialog] = useState(false);
    const handleCloseAddressDialog = (confirm) => {
        setOpenAddAddressDialog(false);
        if (confirm) {
            Notification("Thêm địa chỉ thành công!", "success")
            getCusAddress();
        }
    }

    // First, add a check for default address
    const isDefaultAddress = address.find(addr => addr.id === selectedAddress)?.macDinh;

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Cập nhật thông tin khách hàng
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Bên trái: Ảnh đại diện và thông tin cá nhân */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <label htmlFor="avatar-upload">
                                    <input
                                        accept="image/*"
                                        id="avatar-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                    >
                                        <Avatar
                                            src={previewUrl || formData.hinhAnh || '/default-avatar.jpg'}
                                            sx={{
                                                width: '100px',
                                                height: '100px',
                                                mb: 3,
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 24,
                                                right: 0,
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                                p: 0.5
                                            }}
                                        >
                                            <IconButton
                                                component="span"
                                                size="small"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </label>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Họ và tên"
                                        name="hoTen"
                                        value={formData.hoTen || ''}
                                        onChange={handleChange}
                                        size='small'
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại"
                                        name="soDienThoai"
                                        value={formData.soDienThoai || ''}
                                        onChange={handleChange}
                                        size='small'
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        size='small'
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Giới tính</FormLabel>
                                        <RadioGroup
                                            row
                                            name="gioiTinh"
                                            value={formData.gioiTinh}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel value="true" control={<Radio />} label="Nam" />
                                            <FormControlLabel value="false" control={<Radio />} label="Nữ" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loadingState}
                                    >
                                        {loadingState ? <CircularProgress size={24} /> : 'Cập nhật thông tin'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin địa chỉ
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={e => setOpenAddAddressDialog(true)}
                                >
                                    Thêm mới địa chỉ
                                </Button>
                            </Box>
                            <Grid item xs={12} sx={{ mb: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="address-select-label">Chọn địa chỉ</InputLabel>
                                    <Select
                                        labelId="address-select-label"
                                        id="address-select"
                                        value={selectedAddress}
                                        label="Chọn địa chỉ"
                                        onChange={e => { handleAddressSelect(e.target.value) }}
                                    >
                                        {address.map((item) => (
                                            <MenuItem
                                                key={item.id}
                                                value={item.id}
                                            >
                                                <span>{item.diaChiChiTiet} {item.macDinh ? " (Mặc định)" : ""}</span>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="subtitle1" gutterBottom>
                                Chi tiết địa chỉ
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="province-label">Tỉnh/Thành phố</InputLabel>
                                        <Select
                                            labelId="province-label"
                                            id="province-select"
                                            value={selectedProvince || ''}
                                            label="Tỉnh/Thành phố"
                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                        >
                                            {provinces.map((province) => (
                                                <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                                                    {province.ProvinceName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="district-label">Quận/Huyện</InputLabel>
                                        <Select
                                            labelId="district-label"
                                            id="district-select"
                                            value={selectedDistrict || ''}
                                            label="Quận/Huyện"
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                            disabled={!selectedProvince}
                                        >
                                            {districts.map((district) => (
                                                <MenuItem key={district.DistrictID} value={district.DistrictID}>
                                                    {district.DistrictName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="ward-label">Xã/Phường</InputLabel>
                                        <Select
                                            labelId="ward-label"
                                            id="ward-select"
                                            value={selectedWard || ''}
                                            label="Xã/Phường"
                                            onChange={(e) => handleWardChange(e.target.value)}
                                            disabled={!selectedDistrict}
                                        >
                                            {wards.map((ward) => (
                                                <MenuItem key={ward.WardCode} value={ward.WardCode}>
                                                    {ward.WardName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ chi tiết"
                                    name="diaChiChiTiet"
                                    value={addressData.diaChiChiTiet || ''}
                                    onChange={handleAddressDataChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Tên người nhận"
                                        name="tenNguoiNhan"
                                        value={addressData.tenNguoiNhan || ''}
                                        onChange={handleAddressDataChange}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại người nhận"
                                        name="soDienThoai"
                                        value={addressData.soDienThoai || ''}
                                        onChange={handleAddressDataChange}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Ghi chú"
                                    name="ghiChu"
                                    value={addressData.ghiChu || ''}
                                    onChange={handleAddressDataChange}
                                    multiline
                                    rows={2}
                                    size="small"
                                />
                            </Grid>
                            <Grid container spacing={2} justifyContent="flex-end">
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleUpdateAddress}
                                        disabled={loadingState || selectedAddress === -1}
                                    >
                                        Cập nhật địa chỉ
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteOutlineIcon />}
                                        onClick={handleDeleteAddress}
                                        disabled={
                                            loadingState ||
                                            selectedAddress === -1 ||
                                            address.length < 2 ||
                                            isDefaultAddress
                                        }
                                        sx={{
                                            '&.Mui-disabled': {
                                                borderColor: 'rgba(0, 0, 0, 0.12)',
                                                color: 'rgba(0, 0, 0, 0.26)'
                                            }
                                        }}
                                    >
                                        Xóa địa chỉ
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <AddressDialog idKhachHang={id} open={openAddAddressDialog} onClose={handleCloseAddressDialog} />
        </Container>
    );
};

export default EditCustomer;