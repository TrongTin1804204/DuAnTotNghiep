import * as React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../../../security/Axios";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Notification from '../../../components/Notification';
import { Avatar } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
const vietnameseLocaleText = {
  noRowsLabel: 'Không có dữ liệu',
  columnMenuLabel: 'Menu',
  columnMenuShowColumns: 'Hiển thị cột',
  columnMenuFilter: 'Bộ lọc',
  columnMenuHideColumn: 'Ẩn cột',
  columnMenuUnsort: 'Bỏ sắp xếp',
  columnMenuSortAsc: 'Sắp xếp tăng dần',
  columnMenuSortDesc: 'Sắp xếp giảm dần',
  footerRowsPerPage: 'Số hàng mỗi trang:',
  MuiTablePagination: {
    labelRowsPerPage: 'Số hàng mỗi trang:',
    labelDisplayedRows: ({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
  }
};


export default function Customer() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);

  const openEditModal = (row) => {
    setEditingRow(row);
    setEditModalOpen(true);
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/admin/khach-hang/hien-thi-kh");
      const rowsWithSequence = response.data.map((row, index) => ({
        ...row,
        stt: index + 1
      }));
      console.log(response.data);

      setRows(rowsWithSequence);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = rows.filter((row) => {
        return Object.keys(row).some((field) => {
          const value = row[field];
          if (value == null) return false;
          return value.toString().toLowerCase().includes(searchText.toLowerCase());
        });
      });
      setFilteredRows(filtered);
    } else {
      setFilteredRows(rows);
    }
  }, [searchText, rows]);

  const getStatusColor = (status) => {
    switch (status === 'Còn hoạt động' ? 1 : 0) {
      case 1:
        return "success";
      case 0:
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    { field: 'stt', headerName: 'STT', width: 30 },
    {
      field: 'hinhAnh',
      headerName: 'Ảnh',
      flex: 1,
      renderCell: (params) => (
        params.value ? (
          <img
            src={params.value}
            alt="Avatar"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = null; // This will trigger the Avatar fallback
            }}
          />
        ) : (
          <Avatar sx={{ width: 30, height: 30 }}>
            {params.row.hoTen?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        )
      ),
    },
    { field: 'maKhachHang', headerName: 'Mã khách hàng', flex: 1 },
    { field: 'hoTen', headerName: 'Tên khách hàng', flex: 1 },
    // { field: 'diaChiChiTiet', headerName: 'Địa chỉ', flex: 1 },
    { field: 'gioiTinh', headerName: 'Giới tính', flex: 1 },
    { field: 'soDienThoai', headerName: 'Số điện thoại', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={(params.value)}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'hanhDong',
      headerName: 'Hành động',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() => navigate(`/admin/edit-customer/${params.row.idKhachHang}`)}
          size="small"
        >
          <RemoveRedEyeOutlinedIcon size={18} />
        </IconButton>
      ),
    },
  ];
  const exportToExcel = async () => {
    try {
      setLoadingState(true);
      const response = await api.get("/admin/khach-hang/export-excel").then((response) => response.json())
        .then((result) => {
          setLoadingState(false);
          const ws = XLSX.utils.json_to_sheet(result);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Khách Hàng");
          XLSX.writeFile(wb, "danh_sach_khach_hang.xlsx");
        })
        .catch((error) => {
          setLoadingState(false);
          console.error("Something error when fetch API", error);
        });
    } catch (error) {
      setLoadingState(false);
      console.error("Lỗi khi lấy khách hàng", error);
    }
  };
  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>


      {/* Tiêu đề */}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Quản lý Khách hàng
        </Typography>

        <Grid container spacing={1} width="auto">
          <Grid item>
            <IconButton
              color="primary"
              title="Thêm mới"
              onClick={() => navigate("/admin/add-customer")}
            >
              <AddOutlinedIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              color="primary"
              title="Xuất Excel"
              onClick={exportToExcel}
            >
              <FileDownloadOutlinedIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      {/* Thêm ô tìm kiếm */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm theo tất cả thuộc tính..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* DataGrid */}
      <Paper sx={{ height: '66vh', width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          getRowId={(row) => row.idKhachHang}
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[5, 10, 15]}
          disableColumnResize
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 'none',
            },
            '& .MuiDataGrid-cell': {
              padding: '12px',
            },
            '& .MuiDataGrid-columnSeparator': {
              visibility: 'hidden',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              color: '#333',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            }
          }}
          disableRowSelectionOnClick
          localeText={vietnameseLocaleText}
        />
      </Paper>

    </Box>
  );
}
