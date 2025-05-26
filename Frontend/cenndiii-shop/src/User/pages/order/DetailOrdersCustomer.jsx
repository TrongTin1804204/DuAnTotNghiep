import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { Trash } from "lucide-react";
import { Add, Remove } from '@mui/icons-material';
import PaymentHistory from './PaymentHistory';
import AddressDialog from './AddNewAddress';
import { DataGrid } from '@mui/x-data-grid';
import { Search } from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';

export default function DetailOrdersCustomer() {
    const { idHd } = useParams();
    const [invoice, setInvoice] = useState();
    const [payment, setPayment] = useState();
    const [showHistory, setShowHistory] = useState(false);
    const [histories, setHistories] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [convertedAddress, setConvertedAddress] = useState("");

    const navigate = useNavigate();
    const [total, setTotal] = useState(0);
    const [openPaymentHistory, setOpenPaymentHistory] = useState(false)
    const [openAddressDialog, setOpenAddressDialog] = useState(false);

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [customerAddress, setCustomerAddress] = useState([]);
    const [diaChiChiTiet, setDiaChiChiTiet] = useState("");

    // State cho dialog thêm sản phẩm
    const [openDialogProduct, setOpenDialogProduct] = useState(false);
    const [productDetails, setProductDetails] = useState([]);
    const [productDetailSelected, setProductDetailSelected] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [openSelectQuantity, setOpenSelectQuantity] = useState(false);

    // State cho tìm kiếm và lọc
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

    useEffect(() => {
        if (localStorage.getItem("token")) {
            if (!hasPermission("CUSTOMER")) {
                navigate("/login");
            }
        }
    }, [navigate]);

    const fetchInvoice = async () => {
        if (idHd) {
            const response = await api.get(`/admin/hoa-don/hien-thi/${idHd}`);
            setInvoice(response.data.hoaDon);
            if (response.data.diaChiKhachHang) {
                setCustomerAddress(response.data.diaChiKhachHang)
                setSelectedAddress(response.data.diaChiKhachHang.find(addr => addr.macDinh === true)?.id);
            }
            console.log(response.data.hoaDon);
        }
    };

    const handleRemoveOrderItem = async (idHdct, idCtsp) => {
        try {
            const requestData = {
                idHoaDon: idHd,
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

    const [orderItemsByTab, setOrderItemsByTab] = useState({});
    const [removeItem, setRemoveItem] = useState([]);
    const [openDeleteProductDialog, setOpenDeleteProductDialog] = useState(false);
    useEffect(() => {
        if (!Array.isArray(orderItemsByTab) || orderItemsByTab.length === 0) {
            setTotal(0);
            return;
        }

        const total = orderItemsByTab.reduce((sum, item) => {
            return sum + (item.giaDuocTinh ?? item.donGia) * item.soLuongMua;
        }, 0);

        setTotal(total);
    }, [orderItemsByTab]);

    const getProductFromDetailsInvoice = async () => {
        try {
            const response = await api.get(`/admin/hdct/get-cart/${idHd}`);
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
    }, [idHd]);
    useEffect(() => {
        getProductFromDetailsInvoice()
    }, [])
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
        }
    }
    const handleOpenDialog = (idHdct, idCtsp) => {
        setRemoveItem({ idHdct: idHdct, idCtsp: idCtsp });
        setOpenDeleteProductDialog(true);
    }
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
        setSearchText('');
        setSelectedShoeCollar(null);
        setSelectedShoeSole(null);
        setSelectedShoeToe(null);
        setSelectedMaterial(null);
        setSelectedBrand(null);
        setSelectedSupplier(null);
        setSelectedCategory(null);
    };
    const handleCloseSelectQuantity = () => {
        setOpenSelectQuantity(false);
        setProductDetailSelected(null);
        setSelectedQuantity(1);
    };
    const handleOpenSelectQuantity = (product) => {
        setProductDetailSelected(product);
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
                idHoaDon: idHd,
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
                    idHoaDon: idHd,
                    idHoaDonChiTiet: idHoaDonChiTiet,
                    idChiTietSanPham: idChiTietSanPham,
                    soLuongMua: newQuantity == "tru" ? Number(-1) : Number(1),
                    giaDuocTinh: giaDuocTinh
                };
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
                    idHoaDon: idHd,
                    idHoaDonChiTiet: idHoaDonChiTiet,
                    idChiTietSanPham: idChiTietSanPham,
                    soLuongMua: Number(newQuantity),
                    giaDuocTinh: giaDuocTinh
                };
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
        console.log(selectedAddress);
        console.log(req);
        await api.post(
            `/admin/dia-chi/update-address/${idHd}`,
            req
        ).then(res => {
            if (res.status == 200) {
                Notification("Cập nhật thành công!", "success")
            }
        })
        fetchInvoice();
        getProductFromDetailsInvoice();
    }

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

    const getFilteredRows = () => {
        let filtered = productDetails.filter((item) => {
            if (!item.trangThai || item.giaDuocTinh || Number(item.soLuong) <= 0) return false;
            return true;
        });

        if (searchText) {
            filtered = filtered.filter((row) => {
                return Object.keys(row).some((field) => {
                    const value = row[field];
                    if (value == null) return false;
                    return value.toString().toLowerCase().includes(searchText.toLowerCase());
                });
            });
        }

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
        <div className="p-6 space-y-4 mt-[64px]">
            <div className="bg-white p-4 rounded-lg shadow-md ">
                <h1 className="my-2 text-lg font-semibold flex items-center mb-4">Trạng thái đơn hàng</h1>
                <Stepper order={invoice} onReload={reload} />
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
                                    <TableRow sx={{ height: "40px" }}>
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
                                                    padding: "8px",
                                                    fontSize: "12px",
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
                                                padding: "8px",
                                                fontSize: "12px",
                                            }}>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderItemsByTab && orderItemsByTab.length > 0 ? (
                                        orderItemsByTab.map((item) => (
                                            <TableRow key={item.idHoaDonChiTiet}>
                                                <TableCell align="center" sx={{ width: "200px" }}>
                                                    <div className="flex justify-content-center relative">
                                                        <div>
                                                            <img
                                                                src={item.lienKet}
                                                                alt={item.tenSanPham}
                                                                className="w-12 h-12 object-cover inset-0 rounded-md inline-block"
                                                            />
                                                        </div>
                                                        <div className="ms-1">
                                                            <p>{item.tenSanPham}</p>
                                                            <p className="text-[10px] text-[#8d8674]">{item.tenMau}</p>
                                                            <p className="text-[10px] text-[#8d8674]">{item.tenKichCo}</p>
                                                        </div>
                                                        {!item.trangThai ? (
                                                            <p className="text-red-500 absolute -bottom-5 left-0 w-[500px] text-left">
                                                                *Sản phẩm đã ngừng hoạt động! Chỉ có thể trả lại hoặc thanh toán!
                                                            </p>
                                                        ) : (
                                                            item.giaDuocTinh && (
                                                                <p className="text-red-500 absolute -bottom-5 left-0 w-[500px] text-left">
                                                                    *Sản phẩm có sự thay đổi về giá {item.giaDuocTinh.toLocaleString()} đ → {" "}
                                                                    {item.donGia.toLocaleString()} đ
                                                                </p>
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
                <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-5 gap-4 h-[350px]">
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
                                                >
                                                    {customerAddress.map((address) => (
                                                        <MenuItem key={address.id} value={address.id}>
                                                            {address.diaChiChiTiet}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
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
                        {invoice?.trangThai === "Chờ xác nhận" && (
                            <Button variant="contained" onClick={handleUpdateAddress}>
                                Cập nhật thông tin
                            </Button>
                        )}
                    </div>
                    <div className='col-span-2 h-full bg-white p-4 rounded-lg border h-full text-sm'>
                        <h1 className="text-lg font-semibold mb-4">Hóa đơn</h1>

                        <div className='flex flex-col justify-between py-4 h-3/4'>
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
                        <div className='flex-col justify-between border-t py-2'>
                            <div className='flex justify-between'>
                                <span className='font-bold flex-none'>Số tiền cần thanh toán:</span>
                                <span className='text-red-500 font-semibold'>{invoice?.tongTien?.toLocaleString()} đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Alert
                open={openDeleteProductDialog}
                message={"Bạn có chắc chắn muốn xóa sản phẩm này không?"}
                onClose={handleCloseDialog}
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
                                            src={productDetailSelected.lienKet}
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
            <PaymentHistory idHoaDon={idHd} open={openPaymentHistory} onClose={() => setOpenPaymentHistory(false)} />
        </div>
    );
}