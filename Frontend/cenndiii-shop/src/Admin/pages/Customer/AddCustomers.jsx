import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from "../../components/ui/spinner/LoadingContext";
import Spinner from "../../components/ui/spinner/Spinner";
import api from "../../../security/Axios";
import { hasPermission } from "../../../security/DecodeJWT";
import Notification from '../../../components/Notification';
// MUI Components
import {
    Avatar,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    MenuItem,
    Select,
    InputLabel,
    Grid,
    Typography,
    Box,
    Divider,
    Paper,
    Container
} from '@mui/material';

function AddCustomers() {
    const { loading, setLoadingState } = useLoading();
    const [formData, setFormData] = useState({
        maKhachHang: '',
        hoTen: '',
        gioiTinh: true,
        soDienThoai: '',
        email: '',
        matKhau: '',
        trangThai: true,
        provinceId: '',
        districtId: '',
        wardId: '',
        addressDetails: "",
        provinceName: "",
        districtName: "",
        wardName: ""
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Check permissions on component mount
    useEffect(() => {
        if (localStorage.getItem("token")) {
            if (!hasPermission("ADMIN") && !hasPermission("STAFF")) {
                navigate("/admin/login");
            }
        }
    }, [navigate]);

    // Handle file upload for avatar
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const filePreviewUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(filePreviewUrl);
            setFile(selectedFile);
        }
    };

    // Fetch provinces on component mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Fetch provinces data from API
    const fetchProvinces = async () => {
        try {
            const response = await api.get("/admin/dia-chi/get-province");
            setProvinces(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            Notification(error, "error");
        }
    };

    // Fetch districts when province changes

    // Fetch districts data from API
    const fetchDistricts = async (provinceId) => {
        try {
            const response = await api.get("/admin/dia-chi/get-districts", {
                params: { provinceID: provinceId }
            });
            setDistricts(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            Notification(error, "error");
        }
    };


    // Fetch wards data from API
    const fetchWards = async (districtId) => {
        try {
            const response = await api.get("/admin/dia-chi/get-wards", {
                params: { districtID: districtId }
            });
            setWards(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            Notification(error, "error");
        }
    };

    // Handle province selection
    const handleProvinceChange = (provinceId) => {
        const selectedProvince = provinces.find(p => p.ProvinceID === provinceId);
        const provinceName = selectedProvince ? selectedProvince.ProvinceName : '';
        fetchDistricts(provinceId);

        setFormData(prev => ({
            ...prev,
            provinceId: provinceId,
            provinceName: provinceName,
            districtId: '',
            wardId: '',
            districtName: '',
            wardName: ''
        }));

    };

    // Handle district selection
    const handleDistrictChange = (districtId) => {
        const selectedDistrict = districts.find(d => d.DistrictID === districtId);
        const districtName = selectedDistrict ? selectedDistrict.DistrictName : '';
        fetchWards(districtId);
        setFormData(prev => ({
            ...prev,
            districtId: districtId,
            districtName: districtName,
            // Reset ward when district changes
            wardId: '',
            wardName: ''
        }));
    };

    // Handle ward selection
    const handleWardChange = (wardId) => {
        const selectedWard = wards.find(w => w.WardCode === wardId);
        const wardName = selectedWard ? selectedWard.WardName : '';

        setFormData(prev => ({
            ...prev,
            wardId: wardId,
            wardName: wardName
        }));
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle gender selection
    const handleGenderChange = (event) => {
        setFormData(prev => ({
            ...prev,
            gioiTinh: event.target.value === 'true'
        }));
    };

    // Modify the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingState(true);
        setErrors({});

        // Validate form fields
        const newErrors = {};
        // ...existing validation code...

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoadingState(false);
            return;
        }

        try {
            if (!file) {
                setLoadingState(false);
                Notification("Yêu cầu tải lên ảnh đại diện", "error");
                return;
            }

            // Create FormData object
            const formDataToSend = new FormData();

            // Append file with specific name expected by backend
            formDataToSend.append('fileImage', file);

            // Convert form data to JSON string and append

            formDataToSend.append('user', new Blob([JSON.stringify(formData)], {
                type: 'application/json'
            }));

            const response = await api.post("/admin/khach-hang/them", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.code === 200) {
                Notification("Thêm khách hàng thành công", "success");
                navigate('/admin/customers');
            } else {
                Notification(`${response.data.message}`, "error");
            }

        } catch (error) {
            console.error("Error:", error);
            Notification("Đã xảy ra lỗi khi thêm", "error");
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <Container maxWidth="lg">
            {loading && <Spinner />}

            <Box sx={{ py: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Thêm mới khách hàng
                </Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Thông tin cá nhân
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                        {/* Avatar section */}
                        <Grid item xs={12} md={4} display="flex" justifyContent="center">
                            <Box sx={{ textAlign: 'center' }}>
                                <label htmlFor="avatar-upload">
                                    <input
                                        accept="image/*"
                                        id="avatar-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <Box
                                        component="div"
                                        sx={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.8
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={previewUrl}
                                            sx={{ width: 120, height: 120, margin: '0 auto' }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                                p: 0.5
                                            }}
                                        >
                                            {/* You can add an upload icon here if needed */}
                                        </Box>
                                    </Box>
                                </label>
                            </Box>
                        </Grid>

                        {/* Main info section */}
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Mã Khách hàng"
                                        name="maKhachHang"
                                        value={formData.maKhachHang}
                                        onChange={handleChange}
                                        error={Boolean(errors.maKhachHang)}
                                        helperText={errors.maKhachHang}
                                        size="small"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Họ và tên"
                                        name="hoTen"
                                        value={formData.hoTen}
                                        onChange={handleChange}
                                        error={Boolean(errors.hoTen)}
                                        helperText={errors.hoTen}
                                        size="small"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Số Điện Thoại"
                                        name="soDienThoai"
                                        value={formData.soDienThoai}
                                        onChange={handleChange}
                                        error={Boolean(errors.soDienThoai)}
                                        helperText={errors.soDienThoai}
                                        size="small"
                                        margin="normal"
                                        inputProps={{
                                            pattern: "0[0-9]{9}",
                                            title: "Số điện thoại không hợp lệ"
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl component="fieldset" margin="normal">
                                        <FormLabel component="legend">Giới Tính *</FormLabel>
                                        <RadioGroup
                                            row
                                            name="gioiTinh"
                                            value={formData.gioiTinh.toString()}
                                            onChange={handleGenderChange}
                                        >
                                            <FormControlLabel value="true" control={<Radio size="small" />} label="Nam" />
                                            <FormControlLabel value="false" control={<Radio size="small" />} label="Nữ" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Email section */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                size="small"
                                margin="normal"
                            />
                        </Grid>

                        {/* Address section */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth margin="normal" error={Boolean(errors.provinceId)} size="small">
                                <InputLabel id="province-label">Tỉnh/Thành phố *</InputLabel>
                                <Select
                                    labelId="province-label"
                                    value={formData.provinceId}
                                    onChange={e => handleProvinceChange(e.target.value)}
                                    label="Tỉnh/Thành phố *"
                                >
                                    <MenuItem value="">Chọn Tỉnh/Thành phố</MenuItem>
                                    {provinces.map((province) => (
                                        <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                                            {province.ProvinceName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.provinceId && (
                                    <Typography variant="caption" color="error">
                                        {errors.provinceId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth margin="normal" error={Boolean(errors.districtId)} size="small" disabled={!formData.provinceId}>
                                <InputLabel id="district-label">Quận/Huyện *</InputLabel>
                                <Select
                                    labelId="district-label"
                                    value={formData.districtId}
                                    onChange={e => handleDistrictChange(e.target.value)}
                                    label="Quận/Huyện *"
                                >
                                    <MenuItem value="">Chọn Quận/Huyện</MenuItem>
                                    {districts.map((district) => (
                                        <MenuItem key={district.DistrictID} value={district.DistrictID}>
                                            {district.DistrictName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.districtId && (
                                    <Typography variant="caption" color="error">
                                        {errors.districtId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth margin="normal" error={Boolean(errors.wardId)} size="small" disabled={!formData.districtId}>
                                <InputLabel id="ward-label">Xã/Phường *</InputLabel>
                                <Select
                                    labelId="ward-label"
                                    value={formData.wardId}
                                    onChange={e => handleWardChange(e.target.value)}
                                    label="Xã/Phường *"
                                >
                                    <MenuItem value="">Chọn Xã/Phường</MenuItem>
                                    {wards.map((ward) => (
                                        <MenuItem key={ward.WardCode} value={ward.WardCode}>
                                            {ward.WardName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.wardId && (
                                    <Typography variant="caption" color="error">
                                        {errors.wardId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Địa chỉ chi tiết"
                                name="addressDetails"
                                value={formData.addressDetails}
                                onChange={handleChange}
                                error={Boolean(errors.addressDetails)}
                                helperText={errors.addressDetails}
                                size="small"
                                margin="normal"
                            />
                        </Grid>
                    </Grid>

                    <Box mt={3}>
                        <Button
                            type="submit"
                            variant="outlined"
                            color="warning"
                            sx={{
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Thêm Khách Hàng
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default AddCustomers;