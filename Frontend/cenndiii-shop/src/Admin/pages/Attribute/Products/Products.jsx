import { useState, useEffect } from "react";
import { Search, Eye, Edit, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from '../../../../components/Notification';
import "react-toastify/dist/ReactToastify.css";
import api from "../../../../security/Axios";
import { formatDateFromArray } from "../../../../untils/FormatDate";
import { hasPermission, logout } from "../../../../security/DecodeJWT";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function ProductManagement() {
  const navigate = useNavigate();
  const [sanPhams, setSanPhams] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductStatus, setNewProductStatus] = useState(false);
  const [newProductId, setNewProductId] = useState(null);
  const [nameError, setNameError] = useState("");
  // filter,sort,page
  const [filterModel, setFilterModel] = useState('');
  const [totalItem, setTotalItem] = useState(0);
  //

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
  useEffect(() => {
    if (!hasPermission("ADMIN")) {
      navigate("/admin/login");
      logout();
    }
  }, [navigate]);

  useEffect(() => {
    fetchSanPhams();
  }, [filterModel]);

  const fetchSanPhams = async () => {
    try {
      const response = await api.get("/admin/san-pham/hien-thi"
        ,
        {
          params: {
            keyword: filterModel,
          },
        }
      );
      setSanPhams(response.data);
      setTotalItem(response.data.length);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
  };

  const handleSaveChanges = async (id) => {
    try {
      // Reset error
      setNameError("");

      // Validate empty name
      if (!newProductName.trim()) {
        setNameError("Tên sản phẩm không được để trống");
        return;
      }

      // Check for duplicate names
      const isDuplicate = sanPhams.some(product =>
        product.idSanPham !== id &&
        product.ten.toLowerCase() === newProductName.trim().toLowerCase()
      );

      if (isDuplicate) {
        setNameError("Tên sản phẩm đã tồn tại");
        return;
      }

      // If validation passes, proceed with update
      await api.post(`/admin/san-pham/sua`, {
        idSanPham: id,
        maSanPham: newProductId,
        ten: newProductName.trim(),
        trangThai: newProductStatus,
      });

      fetchSanPhams();
      Notification("Sửa sản phẩm thành công", "success");
      setIsEditModalOpen(false);
    } catch (error) {
      Notification("Sửa sản phẩm thất bại", "error");
    }
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setNewProductName(product.ten);
    setNewProductStatus(product.trangThai);
    setNewProductId(product.maSanPham);
    console.log(product);

    setIsEditModalOpen(true);
  };

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
    { field: 'stt', headerName: 'STT', flex: 0.3 },
    { field: 'maSanPham', headerName: 'Mã', flex: 1 },
    { field: 'ten', headerName: 'Tên', flex: 1 },
    { field: 'soLuong', headerName: 'Số lượng', flex: 0.7 },
    // {
    //   field: 'ngayTao',
    //   headerName: 'Ngày tạo',
    //   flex: 1,
    //   type: 'dateTime',
    //   valueGetter: (params) => {
    //     try {
    //       if (!params?.row?.ngayTao) return null;
    //       // Take first 3 elements for year, month, day
    //       const [year, month, day] = params.row.ngayTao.slice(0, 3);
    //       const date = new Date(year, month - 1, day);
    //       return date;
    //     } catch (error) {
    //       return null;
    //     }
    //   },
    //   renderCell: (params) => {
    //     try {
    //       if (!params?.row?.ngayTao) return 'Không';
    //       return formatDateFromArray(params.row.ngayTao);
    //     } catch (error) {
    //       return '';
    //     }
    //   },
    // },
    // {
    //   field: 'ngaySua',
    //   headerName: 'Ngày sửa',
    //   flex: 1,
    //   type: 'dateTime',
    //   valueGetter: (params) => {
    //     try {
    //       if (!params?.row?.ngaySua) return null;
    //       // Take first 3 elements for year, month, day
    //       const [year, month, day] = params.row.ngaySua.slice(0, 3);
    //       const date = new Date(year, month - 1, day);
    //       return date;
    //     } catch (error) {
    //       return null;
    //     }
    //   },
    //   renderCell: (params) => {
    //     try {
    //       if (!params?.row?.ngaySua) return 'Không';
    //       return formatDateFromArray(params.row.ngaySua);
    //     } catch (error) {
    //       return '';
    //     }
    //   },
    // },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Đang bán" : "Ngừng bán"}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 1,
      renderCell: (params) => (
        <Box >
          <IconButton>
            <NavLink to={`/admin/product-details-manager/${params.row.idSanPham}`} className="text-black p-1 rounded">
              <Eye size={18} stroke="black" />
            </NavLink>
          </IconButton>
          <IconButton onClick={() => openEditModal(params.row)} size="small" className="gap-2">
            <Edit size={18} color="black" />
          </IconButton>
        </Box>

      ),
    },
  ];

  const rows = sanPhams?.map((item, index) => ({
    ...item,
    stt: index + 1,
  }));

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ mb: 4 }}>


        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Quản lý sản phẩm
          </Typography>

          <Button
            component={NavLink}
            to="/admin/product-details"
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            sx={{
              borderRadius: '9999px',
              bgcolor: 'black',
              '&:hover': {
                bgcolor: 'rgb(31, 41, 55)'
              }
            }}
          >
            Thêm Chi Tiết Sản Phẩm
          </Button>
        </Box>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Paper
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
            borderRadius: '24px',
            border: '1px solid #e0e0e0',
            boxShadow: 'none',
            '&:hover': {
              border: '1px solid #bdbdbd',
            }
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <Search size={20} />
          </IconButton>
          <TextField
            sx={{
              ml: 1,
              flex: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '& .MuiInputBase-input': {
                padding: '8px 0'
              }
            }}
            placeholder="Tìm kiếm ..."
            value={filterModel}
            onChange={(e) => {
              setFilterModel(e.target.value);
            }}
            variant="outlined"
          />
        </Paper>
      </Box>
      <Paper sx={{ height: '55vh', width: '100%' }}>
        <DataGrid
          getRowId={(row) => row.idSanPham}
          rows={rows}
          columns={columns}
          rowCount={totalItem}
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
          disableColumnFilter
          disableColumnMenu
          localeText={vietnameseLocaleText}
        />
      </Paper>

      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Cập nhật thông tin sản phẩm
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Tên sản phẩm mới"
              variant="outlined"
              fullWidth
              value={newProductName}
              onChange={(e) => {
                setNewProductName(e.target.value);
                setNameError(""); // Clear error when user types
              }}
              error={!!nameError}
              helperText={nameError}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Trạng thái</Typography>
              <Switch
                checked={newProductStatus}
                onChange={(e) => setNewProductStatus(e.target.checked)}
                color="primary"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditModalOpen(false)}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveChanges(productToEdit.idSanPham)}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}