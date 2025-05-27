import * as React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../../../security/Axios";
import EditModal, { AddModal } from './UpdateAttribute';
import { hasPermission, logout } from "../../../security/DecodeJWT";
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
import Notification from '../../../components/Notification';
export default function Category() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const openEditModal = (row) => {
    setEditingRow(row);
    setEditModalOpen(true);
  };
  useEffect(() => {
    if (!hasPermission("ADMIN")) {
      navigate("/admin/login");
      logout();
    }
  }, [navigate]);
  const handleSaveEdit = async (updatedRow) => {
    const response = await api.post("/admin/danh-muc/sua", {
      idDanhMuc: updatedRow.idDanhMuc,
      ten: updatedRow.ten,
      trangThai: updatedRow.trangThai,
    })
    if (response.status === 200) {
      Notification("Sửa danh mục thành công", "success")
      fetchCategories();
      setEditModalOpen(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/danh-muc/hien-thi");
      const rowsWithSequence = response.data.map((row, index) => ({
        ...row,
        stt: index + 1
      }));
      setRows(rowsWithSequence);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getStatusColor = (status) => {
    switch (Number(status)) {
      case 1:
        return "success";
      case 0:
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    { field: 'stt', headerName: 'STT', width: 80 },
    { field: 'ten', headerName: 'Tên danh mục', flex: 1 },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={Number(params.value) === 1 ? "Đang bán" : "Ngừng bán"}
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
          onClick={() => openEditModal(params.row)}
          size="small"
        >
          <Edit size={18} />
        </IconButton>
      ),
    },
  ];

  const handleAdd = async (ten) => {
    try {
      const response = await api.post("/admin/danh-muc/them", {
        ten: ten,
        trangThai: true,
      });
      if (response.status === 200) {
        Notification("Thêm danh mục thành công", "success");
        fetchCategories();
        setAddModalOpen(false);
      } else {
        Notification(response.data.message, "error");
      }
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      Notification("Có lỗi xảy ra khi thêm danh mục", "error");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Quản lý Danh mục sản phẩm
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setAddModalOpen(true)}
        >
          Thêm danh mục
        </Button>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ height: '66vh', width: '100%' }}>
        <DataGrid
          getRowId={(row) => row.idDanhMuc}
          rows={rows}
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
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9f9f9',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 'none',
            }
          }}
          disableRowSelectionOnClick
          localeText={vietnameseLocaleText}
        />
      </Paper>
      <EditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        data={editingRow}
        existingNames={rows}
        type={"danh mục"}
      />
      <AddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAdd}
        existingNames={rows}
        type={"danh mục"}
      />
    </Box>
  );
}
