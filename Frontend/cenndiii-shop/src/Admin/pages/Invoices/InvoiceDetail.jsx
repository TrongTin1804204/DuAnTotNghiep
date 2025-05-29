import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Notification from '../../../components/Notification';
import api from '../../../security/Axios';
import { hasPermission } from "../../../security/DecodeJWT";
import { useNavigate } from 'react-router-dom';
import Alert from '../../../components/Alert';
import Stepper from "./Stepper"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TextField,
    Box,
    Typography,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    IconButton,
    InputAdornment
} from "@mui/material";
import { Trash, Search } from "lucide-react";
import { Add, Remove } from '@mui/icons-material';
import PaymentHistory from './PaymentHistory';
import AddressDialog from './AddNewAddress';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';

export default function InvoiceDetail() {
    const { idHoaDon } = useParams();
    const [invoice, setInvoice] = useState();
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);
    const [openPaymentHistory, setOpenPaymentHistory] = useState(false)
    const [openAddressDialog, setOpenAddressDialog] = useState(false);


    const [selectedAddress, setSelectedAddress] = useState(null);
    const [customerAddress, setCustomerAddress] = useState([]);

    const [diaChiChiTiet, setDiaChiChiTiet] = useState("");
    useEffect(() => {
        if (localStorage.getItem("token")) {
            if (!hasPermission("ADMIN") && !hasPermission("STAFF")) {
                navigate("/admin/login");
            }
        }
    }, [navigate]);

    const [payments, setPayments] = useState([]);
    const fetchInvoicePaymentHistory = async () => {
        if (idHoaDon) {
            const response = await api.get(`/admin/hoa-don/${idHoaDon}/lich-su-thanh-toan`);
            setPayments(response.data[0]);
        };
    }

    const fetchInvoice = async () => {
        if (idHoaDon) {
            const response = await api.get(`/admin/hoa-don/hien-thi/${idHoaDon}`);
            setInvoice(response.data.hoaDon);
            if (response.data.diaChiKhachHang) {
                setCustomerAddress(response.data.diaChiKhachHang)
                setSelectedAddress(response.data.diaChiKhachHang.find(addr => addr.macDinh === true)?.id);
                setDiaChiChiTiet(response.data.diaChiKhachHang.find(addr => addr.macDinh === true)?.diaChiChiTiet?.split(",")[0]);
            }
        }
    };


    const handleRemoveOrderItem = async (idHdct, idCtsp) => {
        try {

            const requestData = {
                idHoaDon: idHoaDon,
                idHoaDonChiTiet: idHdct,
                idChiTietSanPham: idCtsp
            };

            await api.post("/admin/chi-tiet-san-pham/xoa-sp", requestData);
            getProductFromDetailsInvoice();
            fetchInvoice();
        } catch (error) {
            console.log(error);
        }
    };

    // phần chọn sản phẩm

    const [orderItemsByTab, setOrderItemsByTab] = useState({}); // Thêm state này
    const [removeItem, setRemoveItem] = useState([]);
    const [openDeleteProductDialog, setOpenDeleteProductDialog] = useState(false);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openCancelReasonDialog, setOpenCancelReasonDialog] = useState(false);
    const [lyDoHuy, setLyDoHuy] = useState("");
    const [lyDoHuyError, setLyDoHuyError] = useState("");
    useEffect(() => {
        if (!Array.isArray(orderItemsByTab) || orderItemsByTab.length === 0) {
            setTotal(0);
            return;
        }

        const total = orderItemsByTab.reduce((sum, item) => {
            return sum + item.thanhTien;
        }, 0);

        setTotal(total);
    }, [orderItemsByTab]);


    const getProductFromDetailsInvoice = async () => {
        try {
            const response = await api.get(`/admin/hdct/get-cart/${idHoaDon}`);
            setOrderItemsByTab(response.data);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };
    const reload = async () => {
        fetchInvoice();
        getProductFromDetailsInvoice();

    }
    useEffect(() => {
        fetchInvoice();
        getProductFromDetailsInvoice();
        fetchInvoicePaymentHistory();
    }, [idHoaDon]);
    const handleCloseDialog = (confirm) => {
        setOpenDeleteProductDialog(false);
        if (confirm) {
            handleRemoveOrderItem(removeItem.idHdct, removeItem.idCtsp)
        }
    }
    const handleCloseAddressDialog = (confirm) => {
        setOpenAddressDialog(false);
        if (confirm) {
            Notification("Thêm địa chỉ thành công!", "success")
            // reload()
        }
    }
    const handleOpenDialog = (idHdct, idCtsp) => {
        setRemoveItem({ idHdct: idHdct, idCtsp: idCtsp });
        setOpenDeleteProductDialog(true);
    }
    const [openDialogProduct, setOpenDialogProduct] = useState(false);
    const [productDetails, setProductDetails] = useState([]);
    const [productDetailSelected, setProductDetailSelected] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [openSelectQuantity, setOpenSelectQuantity] = useState(false);
    const handleOpenDialogProduct = () => {
        api
            .get("/admin/chi-tiet-san-pham/dot-giam/hien-thi/-1")
            .then((response) => {
                setProductDetails(response.data);
            })
            .catch((error) => {
                console.error("Error fetching product details:", error);
            });

        setOpenDialogProduct(true);
    };

    const handleCloseDialogProduct = () => {
        setOpenDialogProduct(false);
    };
    const handleCloseSelectQuantity = () => {
        setOpenSelectQuantity(false);
    };
    const handleOpenSelectQuantity = (item) => {
        setProductDetailSelected(item);
        setSelectedQuantity(1);
        setOpenSelectQuantity(true);
    };
    const handleAddProduct = async () => {
        try {
            if (!productDetailSelected) {
                Notification("Vui lòng chọn sản phẩm để thêm!", "warning");
                return;
            }

            const requestData = {
                idHoaDon: idHoaDon,
                idChiTietSanPham: productDetailSelected.idChiTietSanPham,
                soLuongMua: selectedQuantity,
                giaSauGiam: productDetailSelected.giaSauGiam
            };

            const response = await api.post(
                "/admin/chi-tiet-san-pham/them-sp",
                requestData

            );

            if (response.status === 200) {
                getProductFromDetailsInvoice();
                Notification(`Sản phẩm ${productDetailSelected.sanPham} đã được thêm thành công!`, "success");
                fetchInvoice();
                api
                    .get("/admin/chi-tiet-san-pham/dot-giam/hien-thi/-1")
                    .then((response) => {
                        setProductDetails(response.data);
                    })
                    .catch((error) => {
                        console.error("Error fetching product details:", error);
                    });

                setOpenSelectQuantity(false);
            }

        } catch (error) {
            console.error("Error adding product:", error);
            Notification("Đã có lỗi xảy ra khi thêm sản phẩm, vui lòng thử lại!", "error");
        }
    };
    const handleQuantityChange = async (idHoaDonChiTiet, idChiTietSanPham, newQuantity, giaDuocTinh) => {
        if (newQuantity == "tru" || newQuantity == "cong") {
            try {
                const requestData = {
                    idHoaDon: idHoaDon,
                    idHoaDonChiTiet: idHoaDonChiTiet,
                    idChiTietSanPham: idChiTietSanPham,
                    soLuongMua: newQuantity == "tru" ? Number(-1) : Number(1),
                    giaDuocTinh: giaDuocTinh
                };
                // console.log(newQuantity);
                await api.post("/admin/chi-tiet-san-pham/cap-nhat-sl", requestData);
                fetchInvoice();
                getProductFromDetailsInvoice()
            } catch (error) {
                console.error("Error updating product quantity:", error);
                Notification("Đã có lỗi xảy ra khi cập nhật số lượng sản phẩm, vui lòng thử lại!", "error");
            }
        } else if (typeof (Number(newQuantity)) == "number") {
            try {
                const requestData = {
                    idHoaDon: idHoaDon,
                    idHoaDonChiTiet: idHoaDonChiTiet,
                    idChiTietSanPham: idChiTietSanPham,
                    soLuongMua: Number(newQuantity),
                    giaDuocTinh: giaDuocTinh
                };
                // console.log(newQuantity);
                await api.post("/admin/chi-tiet-san-pham/sua-sp", requestData);

                getProductFromDetailsInvoice()
                fetchInvoice();

            } catch (error) {
                console.error("Error updating product quantity:", error);
                Notification("Đã có lỗi xảy ra khi cập nhật số lượng sản phẩm, vui lòng thử lại!", "error");
            }
        }

    };

    const handleAddressChange = (event) => {
        setSelectedAddress(event.target.value);
    };
    const currentAddress = customerAddress.length > 0 ? customerAddress.find((addr) => addr.id === selectedAddress) : invoice;

    useEffect(() => {
        if (customerAddress.length > 0) {
            setSelectedAddress(prev => {
                return prev || customerAddress.find(addr => addr.macDinh)?.id || customerAddress[0]?.id;
            });
        }
    }, [customerAddress]);

    const handleInputChange = (field, value) => {
        setCustomerAddress((prev) =>
            prev.map((addr) =>
                addr.id === selectedAddress ? { ...addr, [field]: value } : addr
            )
        );
    };

    const handleUpdateAddress = async () => {
        const req = customerAddress.find(a => a.id == selectedAddress);
        if (req) {
            // Create a new address string with the updated diaChiChiTiet
            const addressParts = req.diaChiChiTiet.split(',');
            // Replace first part (detailed address) with new value, keep the rest
            addressParts[0] = diaChiChiTiet;
            const updatedAddress = {
                ...req,
                diaChiChiTiet: diaChiChiTiet
            };

            try {
                const response = await api.post(
                    `/admin/dia-chi/update-address/${idHoaDon}`,
                    updatedAddress
                );

                if (response.status === 200) {
                    Notification("Cập nhật thành công!", "success");
                    fetchInvoice();
                    getProductFromDetailsInvoice();
                }
            } catch (error) {
                console.error("Error updating address:", error);
                Notification("Cập nhật thất bại!", "error");
            }
        }
    };

    const [openConfirmContinueDialog, setOpenConfirmContinueDialog] = useState(false);

    const continues = async () => {
        try {
            setOpenConfirmContinueDialog(true);
        } catch (error) {
            console.log(error);
        }
    }

    const handleConfirmContinue = async () => {
        try {
            const response = await api.put(`/admin/hoa-don/${invoice.maHoaDon}/xac-nhan`)
            console.log(response.data);

            if (response.data.code != 500) {
                reload();
                setOpenConfirmContinueDialog(false);
            } else {
                Notification(response.data.message, "error");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const back = async () => {
        try {
            // Kiểm tra nếu là hủy đơn thì hiện dialog nhập lý do
            const btnText = statusBtn(invoice?.trangThai);
            if (btnText && btnText.toLowerCase().includes("hủy")) {
                setOpenCancelReasonDialog(true);
                return;
            }

            // Nếu không phải hủy đơn thì hiện Alert xác nhận
            setOpenConfirmDialog(true);
        } catch (error) {
            console.log(error);
        }
    }

    const handleConfirmBack = async () => {
        try {
            const btnText = statusBtn(invoice?.trangThai);
            const isCancel = btnText && btnText.toLowerCase().includes("hủy");

            const response = await api.put(`/admin/hoa-don/${invoice.maHoaDon}/quay-lai`,
                {},
                {
                    params: {
                        ghiChu: isCancel ? lyDoHuy : ""
                    }
                }
            )
            if (response.data != "") {
                if (isCancel) {
                    setOpenCancelReasonDialog(false);
                    setLyDoHuy("");
                }
                reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    // const handleCancelOrder = async () => {
    //     if (!lyDoHuy.trim()) {
    //         Notification("Vui lòng nhập lý do hủy đơn!", "warning");
    //         return;
    //     }

    //     try {
    //         const response = await api.put(`/admin/hoa-don/${invoice.maHoaDon}/quay-lai`,
    //             {},
    //             {
    //                 params: {
    //                     ghiChu: lyDoHuy
    //                 }
    //             }
    //         )
    //         if (response.data != "") {
    //             setOpenCancelDialog(false);
    //             setLyDoHuy("");
    //             reload();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const isVisible = () => {
        const trangThai = invoice?.trangThai;
        if (trangThai === "Chờ vận chuyển" || trangThai === "Đang vận chuyển" || trangThai === "Hủy") {
            return false;
        }
        if (payments?.hinhThucThanhToan === "VNPay" && (invoice?.tongTien - payments?.soTienThanhToan) < 0 && invoice?.trangThai === "Đã xác nhận") {
            return false;
        }
        return true
    }

    const statusBtn = (status) => {
        if (status === "Chờ xác nhận" || status === "Đã hoàn thành") {
            if (payments?.hinhThucThanhToan === "VNPay") {
                return "Hủy đơn và hoàn tiền"
            } else {
                return "Hủy đơn"
            }
        }

        if (status === "Đã xác nhận") {
            return "Về chờ xác nhận"
        }
    }

    const [showHistory, setShowHistory] = useState(false);

    // Thêm hàm để xử lý đóng/mở Dialog
    const handleOpenHistory = () => {
        setShowHistory(true);
    };

    const handleCloseHistory = () => {
        setShowHistory(false);
    };

    // Thêm các state mới cho tìm kiếm và lọc
    const [searchText, setSearchText] = useState('');
    const [shoeCollars, setShoeCollars] = useState([]);
    const [shoeSoles, setShoeSoles] = useState([]);
    const [shoeToes, setShoeToes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [brands, setBrands] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedShoeCollar, setSelectedShoeCollar] = useState(null);
    const [selectedShoeSole, setSelectedShoeSole] = useState(null);
    const [selectedShoeToe, setSelectedShoeToe] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Thêm useEffect để lấy dữ liệu cho combobox
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coGiayRes, deGiayRes, muiGiayRes, chatLieuRes, thuongHieuRes, nhaCungCapRes, danhMucRes] = await Promise.all([
                    api.get("/admin/co-giay/hien-thi/true"),
                    api.get("/admin/de-giay/hien-thi/true"),
                    api.get("/admin/mui-giay/hien-thi/true"),
                    api.get("/admin/chat-lieu/hien-thi/true"),
                    api.get("/admin/thuong-hieu/hien-thi/true"),
                    api.get("/admin/nha-cung-cap/hien-thi/true"),
                    api.get("/admin/danh-muc/hien-thi/true")
                ]);

                setShoeCollars(coGiayRes.data);
                setShoeSoles(deGiayRes.data);
                setShoeToes(muiGiayRes.data);
                setMaterials(chatLieuRes.data);
                setBrands(thuongHieuRes.data);
                setSuppliers(nhaCungCapRes.data);
                setCategories(danhMucRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // Thêm hàm filter
    const getFilteredRows = () => {
        let filtered = productDetails.filter((item) => {
            if (!item.trangThai || item.giaDuocTinh || Number(item.soLuong) <= 0) return false;
            return true;
        });

        // Lọc theo text search
        if (searchText) {
            filtered = filtered.filter((row) => {
                return Object.keys(row).some((field) => {
                    const value = row[field];
                    if (value == null) return false;
                    return value.toString().toLowerCase().includes(searchText.toLowerCase());
                });
            });
        }

        // Lọc theo các thuộc tính được chọn
        if (selectedShoeCollar) {
            filtered = filtered.filter(row => row.coGiay === selectedShoeCollar.ten);
        }
        if (selectedShoeSole) {
            filtered = filtered.filter(row => row.deGiay === selectedShoeSole.ten);
        }
        if (selectedShoeToe) {
            filtered = filtered.filter(row => row.muiGiay === selectedShoeToe.ten);
        }
        if (selectedMaterial) {
            filtered = filtered.filter(row => row.chatLieu === selectedMaterial.ten);
        }
        if (selectedBrand) {
            filtered = filtered.filter(row => row.thuongHieu === selectedBrand.ten);
        }
        if (selectedSupplier) {
            filtered = filtered.filter(row => row.nhaCungCap === selectedSupplier.ten);
        }
        if (selectedCategory) {
            filtered = filtered.filter(row => row.danhMucSanPham === selectedCategory.ten);
        }

        return filtered;
    };

    const columns = [
        {
            field: 'sanPham',
            headerName: 'Sản phẩm',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <div className='flex items-center gap-2'>
                    <img
                        src={params.row.lienKet}
                        alt={params.row.sanPham}
                        className='w-10 h-10 object-cover rounded-md'
                    />
                    <span className='font-medium text-sm'>{params.row.sanPham}</span>
                </div>
            ),
        },
        {
            field: 'sp',
            headerName: 'Màu sắc/Kích cỡ',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span
                        style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: params.row.mauSac,
                            border: '1px solid #ddd'
                        }}
                    />
                    <span className='text-gray-600 text-sm'>
                        {params.row.mauSac} / {params.row.kichCo}
                    </span>
                </Box>
            ),
        },
        {
            field: 'thongTinSanPham',
            headerName: 'Thông tin sản phẩm',
            flex: 2,
            minWidth: 300,
            renderCell: (params) => (
                <span className='text-gray-600 text-sm'>
                    {`${params.row.coGiay}, ${params.row.muiGiay}, ${params.row.deGiay}, ${params.row.thuongHieu}, ${params.row.chatLieu}, ${params.row.nhaCungCap}, ${params.row.danhMucSanPham}`}
                </span>
            ),
        },
        {
            field: 'giaSauGiam',
            headerName: 'Giá',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => (
                <div className="flex flex-col">
                    {Number(params.row.giaSauGiam) !== Number(params.row.gia) ? (
                        <div className="flex flex-col">
                            <span className='font-medium text-red-500 text-sm'>
                                {params.row.giaSauGiam.toLocaleString()} đ
                            </span>
                            <span className="line-through text-[#929292] text-xs">
                                {params.row.gia.toLocaleString()} đ
                            </span>
                        </div>
                    ) : (
                        <span className='font-medium text-sm'>
                            {params.row.gia.toLocaleString()} đ
                        </span>
                    )}
                </div>
            ),
        },
        {
            field: 'soLuong',
            headerName: 'Số lượng',
            flex: 0.6,
            minWidth: 100,
            renderCell: (params) => (
                <span className='font-medium text-sm'>
                    {params.row.soLuong}
                </span>
            ),
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            flex: 0.6,
            minWidth: 100,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenSelectQuantity(params.row)}
                    className='bg-blue-500 hover:bg-blue-600 text-sm'
                >
                    Chọn
                </Button>
            ),
        },
    ];

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

    return (
        <div className="p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md ">
                <h1 className="my-2 text-lg font-semibold flex items-center mb-4">Trạng thái đơn hàng</h1>
                <Stepper
                    order={invoice}
                    showHistory={showHistory}
                    onClose={handleCloseHistory}
                />
                <div className="flex justify-around w-full mt-4">
                    <div className="flex justify-between w-[300px]">
                        {invoice?.trangThai != "Đã hoàn thành" &&
                            invoice?.trangThai !== "Hủy" && (
                                <>
                                    <Button variant="contained" color="primary" onClick={() => continues()}>
                                        Tiếp tục
                                    </Button>
                                    {isVisible() && (
                                        <Button variant="contained" color="secondary" onClick={() => back()}>
                                            {statusBtn(invoice?.trangThai)}
                                        </Button>
                                    )}
                                </>
                            )}
                    </div>
                    <div>
                        <Button variant="contained" color="info" onClick={handleOpenHistory}>
                            Lịch sử hóa đơn
                        </Button>
                    </div>
                </div>
            </div>
            <div>
                <div className="bg-white p-4 rounded-lg shadow-md my-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-lg font-semibold">Thông tin đơn hàng có mã hóa đơn: {invoice?.maHoaDon}</h1>
                        <div>
                            <button className="p-2 bg-blue-600 text-white rounded-md me-2" onClick={() => setOpenPaymentHistory(true)}>Lịch sử thanh toán</button>
                            {invoice?.trangThai === "Chờ xác nhận" && (
                                <button
                                    className="p-2 bg-blue-600 text-white rounded-md"
                                    onClick={handleOpenDialogProduct}
                                >
                                    Thêm sản phẩm
                                </button>
                            )}
                        </div>

                    </div>
                    <div className="my-2 ">
                        <TableContainer component={Paper} sx={{ maxHeight: "530px" }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ height: "40px" }}> {/* Giảm chiều cao của header */}
                                        {[
                                            "Sản phẩm",
                                            "Số lượng",
                                            "Kho",
                                            "Giá hiện tại",
                                            "Giá được tính",
                                            "Tổng",
                                        ].map((header) => (
                                            <TableCell
                                                key={header}
                                                align="center"
                                                sx={{
                                                    position: "sticky",
                                                    top: 0,
                                                    backgroundColor: "white",
                                                    zIndex: 2,
                                                    padding: "8px", // Giảm padding
                                                    fontSize: "12px", // Giảm font chữ
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                        <TableCell
                                            align="center"
                                            sx={{
                                                width: "10px",
                                                position: "sticky",
                                                top: 0,
                                                backgroundColor: "white",
                                                zIndex: 2,
                                                padding: "8px", // Giảm padding
                                                fontSize: "12px", // Giảm font chữ
                                            }}>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderItemsByTab && orderItemsByTab.length > 0 ? (
                                        orderItemsByTab.map((item) => (
                                            <TableRow key={item?.idHoaDonChiTiet}>
                                                <TableCell align="center" sx={{ width: "200px" }}>
                                                    <div className="flex justify-content-center relative">
                                                        <div>
                                                            <img
                                                                src={item?.lienKet}
                                                                alt={item?.tenSanPham}
                                                                className="w-12 h-12 object-cover inset-0 rounded-md inline-block"
                                                            />
                                                        </div>
                                                        <div className="ms-1">
                                                            <p>{item?.tenSanPham}</p>
                                                            <p className="text-[10px] text-[#8d8674]">{item?.tenMau}</p>
                                                            <p className="text-[10px] text-[#8d8674]">{item?.tenKichCo}</p>
                                                        </div>
                                                        {!item?.trangThai ? (
                                                            <p className="text-red-500 absolute -bottom-5 left-0 w-[500px] text-left">
                                                                *Sản phẩm đã ngừng hoạt động! Chỉ có thể trả lại hoặc thanh toán!
                                                            </p>
                                                        ) : (
                                                            item?.giaDuocTinh && (
                                                                <span className="text-red-500 absolute -bottom-5 left-0 w-[500px] text-left">
                                                                    *Sản phẩm có sự thay đổi về giá {item?.giaDuocTinh.toLocaleString()} đ → {" "}
                                                                    {item?.donGia.toLocaleString()} đ
                                                                </span>
                                                            ) ||
                                                            invoice?.trangThai === "Chờ xác nhận" &&
                                                            item?.soLuongMua > item?.kho && (
                                                                <span className="text-red-500 absolute -bottom-5 left-0 w-[650px] text-left">
                                                                    *Sản phẩm đã hết hoặc mua từ bên khác, vui lòng thương lượng với khách và cập nhật lại số lượng!
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "12px" }}>
                                                    <div className='relative'>
                                                        <div className='absolute -left-3 top-0 bottom-0'>
                                                            {invoice?.trangThai === "Chờ xác nhận" &&
                                                                item.trangThai && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (Number(item.soLuongMua) > 1) {
                                                                                handleQuantityChange(
                                                                                    item.idHoaDonChiTiet,
                                                                                    item.idChiTietSanPham,
                                                                                    "tru",
                                                                                    item.giaDuocTinh
                                                                                );
                                                                            }
                                                                            // else {
                                                                            //     Notification("Đã là số lượng nhỏ nhất !", "warning");
                                                                            //     return;
                                                                            // }
                                                                        }}
                                                                    >
                                                                        <Remove sx={{ fontSize: 15 }} />
                                                                    </button>
                                                                )}
                                                        </div>
                                                        <div>
                                                            {invoice?.trangThai === "Chờ xác nhận" &&
                                                                item.trangThai ? (
                                                                <input
                                                                    type="number"
                                                                    value={item.soLuongMua}
                                                                    onChange={(e) => {
                                                                        if (
                                                                            Number(e.target.value) > 0 &&
                                                                            Number(e.target.value) <= Number(item.soLuongMua) + Number(item.kho)
                                                                        ) {
                                                                            if (e.target.value <= item.kho) {
                                                                                handleQuantityChange(
                                                                                    item.idHoaDonChiTiet,
                                                                                    item.idChiTietSanPham,
                                                                                    e.target.value,
                                                                                    item.giaDuocTinh
                                                                                );
                                                                            }
                                                                        }
                                                                        // else {
                                                                        //     Notification("Chọn số lượng hợp lệ", "error");
                                                                        //     return;
                                                                        // }
                                                                    }}
                                                                    className="text-center w-8"
                                                                />
                                                            ) : (
                                                                <span>{item.soLuongMua}</span>
                                                            )}
                                                        </div>
                                                        <div className='absolute -right-3 top-0 bottom-0'>
                                                            {invoice?.trangThai === "Chờ xác nhận" &&
                                                                item.trangThai && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (Number(item.kho) > 0) {
                                                                                if (Number(item.soLuongMua) < Number(item.kho)) {
                                                                                    if (!item.giaDuocTinh) {
                                                                                        handleQuantityChange(
                                                                                            item.idHoaDonChiTiet,
                                                                                            item.idChiTietSanPham,
                                                                                            "cong",
                                                                                            item.giaDuocTinh
                                                                                        );
                                                                                    } else {
                                                                                        Notification(
                                                                                            "Sản phẩm đã thay đổi giá chỉ có thể mua hoặc trả lại!",
                                                                                            "warning"
                                                                                        );
                                                                                        return;
                                                                                    }
                                                                                }
                                                                            }
                                                                            else {
                                                                                Notification("Đã hết hàng trong kho!", "warning");
                                                                                return;
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Add sx={{ fontSize: 15 }} />
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </div>

                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "12px" }}>{item.kho}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: "12px" }}>{item.donGia.toLocaleString()} đ</TableCell>
                                                <TableCell align="center" sx={{ fontSize: "12px" }}>
                                                    {(item.giaDuocTinh ?? item.donGia).toLocaleString()} đ
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "12px" }}>{item.thanhTien.toLocaleString()} đ</TableCell>
                                                <TableCell sx={{ width: "10px", padding: "4px", }}>
                                                    {invoice?.trangThai === "Chờ xác nhận" && (

                                                        <button
                                                            disabled={Number(item.soLuongMua) === 1 && Number(orderItemsByTab.length) === 1}
                                                            onClick={() => handleOpenDialog(item.idHoaDonChiTiet, item.idChiTietSanPham)}
                                                        >
                                                            <Trash size={16} className={`${Number(item.soLuongMua) === 1 && Number(orderItemsByTab.length) === 1 ? 'text-[#ADAAAB]' : 'text-red-600'}`} />
                                                        </button>

                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                Chưa có sản phẩm nào
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-5 gap-4 h-[400px]">
                    <div className="flex flex-col justify-between bg-white p-4 rounded-lg border col-span-3 h-full">
                        <div>
                            <div className='flex flex-col justify-between text-sm'>

                                <div className='flex-auto'>
                                    <div className='flex justify-between'>
                                        <h1 className="text-lg font-semibold mb-4">Thông tin khách hàng</h1>

                                        {invoice?.trangThai == "Chờ xác nhận" && (
                                            <div className='m-2'>
                                                <Button variant="contained" color="primary" size='small' onClick={e => setOpenAddressDialog(true)}>{invoice?.loaiDon === "Online" && invoice?.khachHang === null ? "Sửa địa chỉ" : "Thêm địa chỉ"}</Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-4'>
                                        {customerAddress.length > 0 && (
                                            <FormControl fullWidth>
                                                <InputLabel id='address'>Địa chỉ</InputLabel>
                                                <Select
                                                    label="Địa chỉ"
                                                    value={
                                                        selectedAddress
                                                        ?? (customerAddress
                                                            ? customerAddress.find(a => a.diaChiChiTiet === invoice?.diaChiChiTiet)?.id
                                                            : '')
                                                    }
                                                    disabled={invoice?.trangThai != "Chờ xác nhận"}
                                                    onChange={handleAddressChange}
                                                    labelId="address"
                                                    size="small"
                                                // sx={{ fontSize: '10px' }}
                                                >
                                                    {customerAddress.map((address) => (
                                                        <MenuItem key={address.id} value={address.id}>
                                                            {address.diaChiChiTiet}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                        )}
                                        {customerAddress.length <= 0 ? (
                                            <Box>
                                                <TextField
                                                    disabled={invoice?.trangThai != "Chờ xác nhận"}
                                                    label="Địa chỉ"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    sx={{ fontSize: "10px" }}
                                                    value={currentAddress?.diaChiChiTiet || ""}
                                                />
                                            </Box>
                                        ) : (
                                            <Box>
                                                <TextField
                                                    disabled={invoice?.trangThai != "Chờ xác nhận"}
                                                    label="Địa chỉ chi tiết"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    sx={{ fontSize: "10px" }}
                                                    value={diaChiChiTiet || ""}
                                                    onChange={(e) => setDiaChiChiTiet(e.target.value)}
                                                />
                                            </Box>
                                        )}
                                        <Box display="flex" gap={2}>
                                            <TextField
                                                label="Tên người nhận"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                sx={{ fontSize: "10px" }}
                                                disabled={invoice?.trangThai != "Chờ xác nhận"}
                                                value={currentAddress?.tenNguoiNhan || ""}
                                                onChange={(e) => handleInputChange("tenNguoiNhan", e.target.value)}
                                            />

                                            <TextField
                                                label="Số điện thoại"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                disabled={invoice?.trangThai != "Chờ xác nhận"}
                                                sx={{ fontSize: "10px" }}
                                                value={currentAddress?.soDienThoai || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^\d*$/.test(value)) {
                                                        handleInputChange("soDienThoai", value);
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Ô nhập ghi chú */}
                                        <TextField
                                            label="Ghi chú"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled={invoice?.trangThai != "Chờ xác nhận"}
                                            sx={{ fontSize: "10px" }}
                                            value={currentAddress?.ghiChu || ""}
                                            onChange={(e) => handleInputChange("ghiChu", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {customerAddress.length > 0 && (
                            invoice?.trangThai === "Chờ xác nhận" && (
                                <Button variant="contained" onClick={handleUpdateAddress}>
                                    Cập nhật thông tin
                                </Button>
                            )
                        )}
                    </div>
                    {/* Bên phải: Hóa đơn */}
                    <div className='col-span-2 h-full bg-white p-4 rounded-lg border h-full text-sm'>

                        <div className='flex flex-col justify-between h-3/4'>
                            <h1 className="text-lg font-semibold mb-4">Hóa đơn</h1>

                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Tổng tiền:</span>
                                <span>{total.toLocaleString() || "0"} đ</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Giảm giá:</span>
                                <span className='text-green-500'>- {invoice?.giaDuocGiam?.toLocaleString() || "0"} đ</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Phí vận chuyển:</span>
                                <span className='text-red-500 font-semibold'>+ {invoice?.phiVanChuyen?.toLocaleString() || "0"} đ</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Phụ phí:</span>
                                <span className='text-red-500 font-semibold'>+ {invoice?.phuPhi?.toLocaleString() || "0"} đ</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Hoàn phí:</span>
                                <span className='text-green-500 font-semibold'>- {invoice?.hoanPhi?.toLocaleString() || "0"} đ</span>
                            </div>
                        </div>
                        <div className='flex-col justify-between border-t py-2 h-1/4'>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Số tiền cần thanh toán:</span>
                                <span className='text-red-500 font-semibold'>{invoice?.tongTien?.toLocaleString()} đ</span>
                            </div>

                            {payments?.hinhThucThanhToan === "VNPay" && (
                                <>
                                    <div className='flex justify-between'>
                                        <span className='font-bold flex-none'>Số tiền đã thanh toán:</span>
                                        <span className='text-green-500 font-semibold'>{payments?.soTienThanhToan?.toLocaleString()} đ</span>
                                    </div>

                                    {(invoice?.tongTien - payments?.soTienThanhToan) > 0 && (
                                        <div className='flex justify-between'>
                                            <span className='font-bold flex-none'>Cần trả thêm:</span>
                                            <span className='text-red-500 font-semibold'>{(invoice?.tongTien - payments?.soTienThanhToan)?.toLocaleString()} đ</span>
                                        </div>
                                    )}

                                    {(invoice?.tongTien - payments?.soTienThanhToan) < 0 && (
                                        <div className='flex justify-between'>
                                            <span className='font-bold flex-none'>Cần hoàn lại:</span>
                                            <span className='text-green-500 font-semibold'>{Math.abs(invoice?.tongTien - payments?.soTienThanhToan)?.toLocaleString()} đ</span>
                                        </div>
                                    )}

                                    {(invoice?.tongTien - payments?.soTienThanhToan) === 0 && (
                                        <div className='flex justify-between'>
                                            <span className='font-bold flex-none'>Trạng thái:</span>
                                            <span className='text-blue-500 font-semibold'>Đã thanh toán đủ</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Alert
                open={openDeleteProductDialog}
                message={"Bạn có chắc chắn muốn xóa sản phẩm này không?"}
                onClose={handleCloseDialog}
            />
            <Alert
                open={openConfirmDialog}
                message={"Bạn có chắc chắn muốn thực hiện hành động này không?"}
                onClose={(confirm) => {
                    setOpenConfirmDialog(false);
                    if (confirm) {
                        handleConfirmBack();
                    }
                }}
            />
            <Dialog
                open={openDialogProduct}
                onClose={handleCloseDialogProduct}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                        height: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <DialogTitle sx={{
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 className='text-xl font-semibold'>Danh sách sản phẩm</h2>
                    <IconButton
                        onClick={handleCloseDialogProduct}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'gray',
                            '&:hover': {
                                color: 'black',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Thêm thanh tìm kiếm */}
                        <div className="p-2 border-b">
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={16} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchText && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchText('')}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Cổ giày</InputLabel>
                                    <Select
                                        value={selectedShoeCollar || ''}
                                        onChange={(e) => setSelectedShoeCollar(e.target.value)}
                                        label="Cổ giày"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {shoeCollars.map((item) => (
                                            <MenuItem key={item.idCoGiay} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Đế giày</InputLabel>
                                    <Select
                                        value={selectedShoeSole || ''}
                                        onChange={(e) => setSelectedShoeSole(e.target.value)}
                                        label="Đế giày"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {shoeSoles.map((item) => (
                                            <MenuItem key={item.idDeGiay} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Mũi giày</InputLabel>
                                    <Select
                                        value={selectedShoeToe || ''}
                                        onChange={(e) => setSelectedShoeToe(e.target.value)}
                                        label="Mũi giày"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {shoeToes.map((item) => (
                                            <MenuItem key={item.idMuiGiay} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Chất liệu</InputLabel>
                                    <Select
                                        value={selectedMaterial || ''}
                                        onChange={(e) => setSelectedMaterial(e.target.value)}
                                        label="Chất liệu"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {materials.map((item) => (
                                            <MenuItem key={item.idChatLieu} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Thương hiệu</InputLabel>
                                    <Select
                                        value={selectedBrand || ''}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        label="Thương hiệu"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {brands.map((item) => (
                                            <MenuItem key={item.idThuongHieu} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Nhà cung cấp</InputLabel>
                                    <Select
                                        value={selectedSupplier || ''}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                        label="Nhà cung cấp"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {suppliers.map((item) => (
                                            <MenuItem key={item.idNhaCungCap} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Danh mục</InputLabel>
                                    <Select
                                        value={selectedCategory || ''}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        label="Danh mục"
                                    >
                                        <MenuItem value={null}>Tất cả</MenuItem>
                                        {categories.map((item) => (
                                            <MenuItem key={item.idDanhMuc} value={item}>
                                                {item.ten}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <DataGrid
                            getRowId={(row) => row.idChiTietSanPham}
                            rows={getFilteredRows()}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            checkboxSelection={false}
                            disableSelectionOnClick
                            disableColumnSelector
                            disableColumnMenu
                            hideFooterSelectedRowCount
                            sx={{
                                '& .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    fontWeight: 'bold',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    overflow: 'auto',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-cell': {
                                    whiteSpace: 'normal',
                                    lineHeight: 'normal',
                                    padding: '8px',
                                },
                                '& .MuiDataGrid-columnHeader': {
                                    whiteSpace: 'normal',
                                    lineHeight: 'normal',
                                    padding: '8px',
                                },
                                '& .MuiDataGrid-main': {
                                    overflow: 'hidden',
                                },
                                '& .MuiDataGrid-virtualScrollerContent': {
                                    height: '100% !important',
                                    overflow: 'auto !important'
                                }
                            }}
                            localeText={vietnameseLocaleText}
                            style={{ height: 'calc(100vh - 250px)' }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog chọn số lượng sản phẩm */}
            <Dialog
                open={openSelectQuantity}
                onClose={handleCloseSelectQuantity}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Chọn số lượng sản phẩm</DialogTitle>
                <DialogContent>
                    {productDetailSelected && (
                        <div className="space-y-4">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-2/3 grid grid-cols-2">
                                    <div>
                                        <img
                                            src={
                                                productDetailSelected.lienKet
                                            }
                                            alt={productDetailSelected.sanPham}
                                            className="size-60 object-cover rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">
                                            Tên sản phẩm: {productDetailSelected.sanPham}
                                        </h2>
                                        <p>Cổ giày: {productDetailSelected.coGiay}</p>
                                        <p>Mũi giày: {productDetailSelected.muiGiay}</p>
                                        <p>Đế giày: {productDetailSelected.deGiay}</p>
                                        <p>Thương hiệu: {productDetailSelected.thuongHieu}</p>
                                        <p>Chất liệu: {productDetailSelected.chatLieu}</p>
                                        <p>Nhà cung cấp: {productDetailSelected.nhaCungCap}</p>
                                        <p>Danh mục: {productDetailSelected.danhMucSanPham}</p>
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <p>
                                        Giá: {Number(productDetailSelected.giaSauGiam) !== Number(productDetailSelected.gia) ? (
                                            <span>
                                                <span className='text-red-500 text-lg'> {productDetailSelected.giaSauGiam.toFixed(2)}đ </span>
                                                <span className="line-through text-[#929292] text-sm"> {productDetailSelected.gia.toFixed(2)}đ</span>
                                            </span>
                                        ) : (
                                            <span>{productDetailSelected.gia} <span className='ordinal'>đ</span> </span>
                                        )}
                                    </p>

                                    <p>Số lượng còn lại: {productDetailSelected.soLuong}</p>
                                </div>
                            </div>
                            <TextField
                                id="outlined-number"
                                label="Số lượng đặt"
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) => {
                                    let value = Number(e.target.value);
                                    if (value < 1) value = 1;
                                    else if (value > productDetailSelected.soLuong)
                                        value = productDetailSelected.soLuong;
                                    setSelectedQuantity(value);
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                fullWidth
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleAddProduct}>
                        Thêm
                    </Button>
                    <Button onClick={handleCloseSelectQuantity}>Hủy</Button>
                </DialogActions>
            </Dialog>

            <AddressDialog hoaDon={invoice} reload={reload} open={openAddressDialog} onClose={handleCloseAddressDialog} />
            {/* ô lịch sử thanh toán */}
            <PaymentHistory idHoaDon={idHoaDon} open={openPaymentHistory} onClose={() => setOpenPaymentHistory(false)} />

            <Alert
                open={openCancelDialog}
                message={"Nhập lý do hủy đơn"}
                onClose={() => setOpenCancelDialog(false)}
            />

            <Alert
                open={openConfirmContinueDialog}
                message={"Bạn có chắc chắn muốn tiếp tục không?"}
                onClose={(confirm) => {
                    setOpenConfirmContinueDialog(false);
                    if (confirm) {
                        handleConfirmContinue();
                    }
                }}
            />

            <Dialog
                open={openCancelReasonDialog}
                onClose={() => {
                    setOpenCancelReasonDialog(false);
                    setLyDoHuyError("");
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Nhập lý do hủy đơn</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Lý do hủy"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={lyDoHuy}
                        onChange={(e) => {
                            setLyDoHuy(e.target.value);
                            setLyDoHuyError("");
                        }}
                        error={!!lyDoHuyError}
                        helperText={lyDoHuyError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenCancelReasonDialog(false);
                        setLyDoHuyError("");
                    }}>Hủy</Button>
                    <Button
                        onClick={() => {
                            if (!lyDoHuy.trim()) {
                                setLyDoHuyError("Vui lòng nhập lý do hủy đơn!");
                                return;
                            }
                            handleConfirmBack();
                        }}
                        variant="contained"
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}