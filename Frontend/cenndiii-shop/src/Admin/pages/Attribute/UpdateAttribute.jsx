import * as React from 'react';
import {
    Modal,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { hasPermission, logout } from "../../../security/DecodeJWT";
import { useNavigate } from 'react-router-dom';

export const AddModal = ({ open, onClose, onAdd, existingNames = [], type }) => {
    const [ten, setTen] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setTen('');
            setError('');
        }
    }, [open]);

    const handleAdd = () => {
        const trimmedTen = ten.trim().toLowerCase();

        if (!trimmedTen) {
            setError(`Tên ${type} không được để trống`);
            return;
        }

        if (existingNames.map((data) => data.ten.toLowerCase()).includes(trimmedTen)) {
            setError(`Tên ${type} đã tồn tại`);
            return;
        }

        setError('');
        onAdd(ten.trim());
        setTen('');
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: '#fff',
                    color: '#000',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: 400,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Thêm {type}
                </Typography>

                <TextField
                    fullWidth
                    label={`Tên ${type}`}
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    error={!!error}
                    helperText={error}
                    sx={{ mb: 2 }}
                />

                <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="contained" onClick={handleAdd}>
                        Thêm
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

const EditModal = ({ open, onClose, onSave, data, existingNames = [], type }) => {
    const [ten, setTen] = useState('');
    const [trangThai, setTrangThai] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!hasPermission("ADMIN")) {
            navigate("/admin/login");
            logout();
        }
    }, [navigate]);
    useEffect(() => {
        if (data) {
            setTen(data.ten);
            setTrangThai(data.trangThai);
            setError('');
        }
    }, [open]);

    const handleSave = () => {
        const trimmedTen = ten.trim().toLowerCase();
        const currentTen = data?.ten?.toLowerCase();

        if (!trimmedTen) {
            setError(`Tên ${type} không được để trống`);
            return;
        }

        if (
            existingNames
                .map((data) => data.ten.toLowerCase())
                .includes(trimmedTen) &&
            trimmedTen !== currentTen
        ) {
            setError(`Tên ${type} đã tồn tại`);
            return;
        }

        setError('');
        onSave({ ...data, ten: ten.trim(), trangThai });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: '#fff',
                    color: '#000',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: 400,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Sửa {type}
                </Typography>

                <TextField
                    fullWidth
                    label={`Tên ${type}`}
                    value={ten}
                    onChange={(e) => setTen(e.target.value)}
                    error={!!error}
                    helperText={error}
                    sx={{ mb: 2 }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={trangThai}
                            onChange={(e) => setTrangThai(e.target.checked)}
                        />
                    }
                    label="Đang bán"
                />

                <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                        Xác nhận
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default EditModal;
