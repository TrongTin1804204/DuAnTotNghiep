import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AddCircleOutline, EditLocationAlt } from '@mui/icons-material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Box,
    FormHelperText,
} from '@mui/material';
import CustomerDialog from "../Customer/AddCustomerDialog";
import Delivery from "./Delivery";
import api from "../../../security/Axios";
import { hasPermission } from "../../../security/DecodeJWT";
import Alert from "../../../components/Alert";
import Notification from '../../../components/Notification';
import AddressDialog from "./AddCusstomerAddress";
import UpdateCustomerAddress from "./UpdateCustomerAddress";

const DeliveryForm = ({ totalItem, total, invoiceId, reloadTab, activeOrderId }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: 0,
        maKhachHang: '',
        hoTen: '',
        gioiTinh: true,
        soDienThoai: '',
        email: '',
        matKhau: '',
        trangThai: true,
        provinceId: 0,
        districtId: 0,
        wardId: 0,
        addressDetails: "",
        addressMappers: [],
        image: "",
        imageBase64: ""
    });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [amount, setAmount] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(-1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState();
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [lastTotal, setLastTotal] = useState(total);
    const [totalAmount, setTotalAmount] = useState(0);
    const [deliveryMethod, setDeliveryMethod] = useState("taiquay");
    const [paymentMethod, setPaymentMethod] = useState("tienmat");
    const [cashAmount, setCashAmount] = useState(0);
    const [transferAmount, setTransferAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [orders, setOrders] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [filteredVouchers, setFilteredVouchers] = useState([]);
    const [bestVoucherApplied, setBestVoucherApplied] = useState(false);
    const [initialBestVoucherId, setInitialBestVoucherId] = useState(null);
    const [manualVoucherSelected, setManualVoucherSelected] = useState(false);
    const [originalVouchers, setOriginalVouchers] = useState([]);
    const [voucherSearched, setVoucherSearched] = useState(false);

    const [openPayAlert, setOpenPayAlert] = useState(false);

    ///////////////////////

    const [waitingTransferConfirm, setWaitingTransferConfirm] = useState(false);

    //////////////////////
    // dialog add address
    const [openAddAddressDialog, setOpenAddAddressDialog] = useState(false);
    const handleCloseAddressDialog = (confirm) => {
        setOpenAddAddressDialog(false);
        if (confirm) {
            Notification("Thêm địa chỉ thành công!", "success")
            reload()
        }
    }

    // dialog update address
    const [openUpdateAddressDialog, setOpenUpdateAddressDialog] = useState(false);
    const handleCloseUpdateAddressDialog = (confirm) => {
        setOpenUpdateAddressDialog(false);
        if (confirm) {
            Notification("Sửa địa chỉ thành công!", "success")
            reload()
        }
    }

    ///////////
    const resendQrToApp = () => {
        if (window.stompClient?.connected) {
            const soTienCanChuyenKhoan =
                paymentMethod === "chuyenkhoan" ? lastTotal : transferAmount;
            window.stompClient.publish({
                destination: "/app/switch-invoice",
                body: JSON.stringify({
                    idHoaDon: invoiceId.idHoaDon,
                    tongTienSauCung: lastTotal,
                    soTienChuyenKhoan: soTienCanChuyenKhoan,
                    soTienGiam: discountAmount,
                    paymentType: "chuyenkhoan"
                }),
            });
            toast.success("Đã gửi lại mã QR cho khách!");
        } else {
            toast.error("Không kết nối được tới app!");
        }
    };

    ////////////////

    const getConfirm = async (confirm) => {
        setOpenPayAlert(false);
        if (confirm) {
            if (!invoiceId) {
                navigate("/admin/orders", { state: { message: "Chưa chọn sản phẩm", type: "error" } });
                return;
            }
            if (paymentMethod === "cahai" && (Number(cashAmount) + Number(transferAmount) !== lastTotal)) {
                navigate("/admin/orders", { state: { message: "Tổng tiền chưa đủ hoặc đang lớn hơn", type: "error" } });
                return;
            }
            handleSubmit(onSubmit)();
        }
    };

    const handleOpenPayAlert = () => {
        setOpenPayAlert(true);
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            if (!hasPermission("ADMIN") && !hasPermission("STAFF")) {
                navigate("/admin/login");
            }
        }
    }, [navigate]);
    const token = localStorage.getItem("token") || "";
    const headersGHN = {
        token: "a9cd42d9-f28a-11ef-a268-9e63d516feb9",
        "Content-Type": "application/json",
    };

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    // giao hang khach le

    const [openDeliveryForm, setOpenDeliveryForm] = useState(false);
    const [deliveryData, setDeliveryData] = useState([]);
    const handleShippingFeeUpdate = (confirm, data, error) => {
        if (error) {
            navigate("/admin/orders", { state: { message: error.message, type: error.type } });
            return;
        }
        if (confirm) {
            setDeliveryData(data);
            setAmount(data.amount)
        } else {
            setDeliveryData(data);
            setDeliveryMethod("taiquay")
        }
        setOpenDeliveryForm(false);
    };

    useEffect(() => {
        setLastTotal(calculateLastTotal(total, amount, discountAmount));
    }, [total, amount, discountAmount]);

    useEffect(() => {
        setFilteredVouchers(total > 0 ? originalVouchers.filter(v => total >= v.dieuKien) : originalVouchers);
    }, [total]);


    const onSubmit = async () => {

        //Chặn xử lý ngay nếu chọn chuyển khoản
        if ((paymentMethod === "chuyenkhoan" || paymentMethod === "cahai") && !waitingTransferConfirm) {
            const soTienCanChuyenKhoan =
                paymentMethod === "chuyenkhoan" ? lastTotal : transferAmount;

            if (window.stompClient?.connected) {
                window.stompClient.publish({
                    destination: "/app/switch-invoice",
                    body: JSON.stringify({
                        idHoaDon: invoiceId.idHoaDon,
                        tongTienSauCung: lastTotal,
                        soTienChuyenKhoan: soTienCanChuyenKhoan,
                        soTienGiam: discountAmount,
                        paymentType: "chuyenkhoan",
                    }),
                });
                toast.info("Đang chờ khách quét mã QR và thanh toán...");
                setWaitingTransferConfirm(true);
            } else {
                toast.error("Không kết nối được tới app để gửi dữ liệu hóa đơn!");
            }
            return;
        }
        // Phần xử lý như cũ nếu là tiền mặt 
        const thanhToanHoaDon = [];
        if (paymentMethod === "tienmat") {
            thanhToanHoaDon.push({ hinhThucThanhToan: "tienmat", soTien: lastTotal });
        } else if (paymentMethod === "chuyenkhoan") {
            thanhToanHoaDon.push({ hinhThucThanhToan: "chuyenkhoan", soTien: lastTotal });
        } else if (paymentMethod === "cahai") {
            thanhToanHoaDon.push({ hinhThucThanhToan: "tienmat", soTien: cashAmount });
            thanhToanHoaDon.push({ hinhThucThanhToan: "chuyenkhoan", soTien: transferAmount });
        }

        const requestData = {
            idHoaDon: invoiceId.idHoaDon,
            maHoaDon: invoiceId.maHoaDon,
            khachHang: selectedCustomerId,
            tongTien: lastTotal,
            phiVanChuyen: deliveryMethod === "giaohang" ? amount : 0,
            trangThai: "Đã thanh toán",
            ngaySua: new Date().toISOString(),
            nguoiSua: null,
            loaiDon: "Tại cửa hàng",
            phuongThucNhanHang: deliveryMethod,
            thanhToanHoaDon,
            tenNguoiNhan: deliveryMethod === "giaohang" ? (deliveryData?.hoTen || null) : null,
            soDienThoai: deliveryMethod === "giaohang" ? (deliveryData?.soDienThoai || null) : null,
            email: deliveryMethod === "giaohang" ? (deliveryData?.email || null) : null,
            ghiChu: deliveryMethod === "giaohang" ? (deliveryData?.ghiChu || "") : "",
            diaChi: selectedCustomerId !== -1 ? customers.find(c => c.idKhachHang === selectedCustomerId)?.diaChi || "" : deliveryData?.diaChi || "",
            idPhieuGiamGia: selectedVoucher || null,
        };

        if (lastTotal <= 0) {
            navigate("/admin/orders", { state: { message: "Chưa chọn sản phẩm", type: "error" } });
            return;
        }

        try {
            const response = await api.post('/admin/hoa-don/thanh-toan', requestData);
            if (response.status === 200) {
                if (selectedVoucher) {
                    try {
                        await api.patch(`/admin/phieu-giam-gia/tru-so-luong-pgg/${selectedVoucher}`);
                    } catch (voucherError) {
                        console.error("Lỗi khi cập nhật số lượng phiếu giảm giá:", voucherError);
                    }
                }
                const fetchOrders = async () => {
                    try {
                        const response = await api.get('/admin/hoa-don/hd-ban-hang');
                        setOrders(response.data);
                    } catch (error) {
                        console.error('Error fetching orders:', error);
                    }
                };
                fetchOrders();
                reloadTab();
                navigate("/admin/orders", { state: { message: "Thanh toán thành công", type: "success" } });
                handlePrint(requestData, totalItem, customers.find(c => c.idKhachHang === selectedCustomerId)?.hoTen);
                // gửi đi
                window.stompClient?.publish({
                    destination: "/app/invoice-paid",
                    body: JSON.stringify({
                        message: "Đã xác nhận chuyển khoản!",
                        idHoaDon: invoiceId.idHoaDon
                    })
                });
                setWaitingTransferConfirm(false);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            navigate("/admin/orders", { state: { message: "Lỗi khi thanh toán", type: "error" } });
        }
    };

    useEffect(() => {
        const paymentSuccess = localStorage.getItem("paymentSuccess");
        if (paymentSuccess === "true") {
            localStorage.removeItem("paymentSuccess");
            handleSubmit(onSubmit)();
        }
    }, []);
    const fetchPublicVouchers = async () => {
        try {
            const response = await api.get('/admin/phieu-giam-gia/hien-thi-voucher', {
                params: { khachHangId: selectedCustomerId },
            });

            const validVouchers = total > 0
                ? response.data.filter(v => total >= v.dieuKien) : response.data;

            setOriginalVouchers(validVouchers);
            setFilteredVouchers(validVouchers);

            // Chỉ áp dụng voucher tốt nhất khi chưa có voucher được chọn thủ công
            if (!manualVoucherSelected) {
                const { bestVoucher, maxDiscount } = calculateBestVoucher(total, validVouchers);
                if (bestVoucher) {
                    setSelectedVoucher(bestVoucher.id);
                    setDiscountAmount(maxDiscount);
                    setLastTotal(calculateLastTotal(total, amount, maxDiscount));
                    setBestVoucherApplied(true);
                } else {
                    // Nếu không có voucher phù hợp thì reset giảm giá
                    setSelectedVoucher('');
                    setDiscountAmount(0);
                    setLastTotal(calculateLastTotal(total, amount, 0));
                    setBestVoucherApplied(false);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy phiếu giảm giá công khai:", error);
        }
    };
    useEffect(() => {
        if (deliveryMethod === "giaohang") {
            calculateShippingFee()
        }
    }, [totalItem, selectedDistrict, selectedWard]);
    useEffect(() => {
        fetchPublicVouchers();
    }, [selectedCustomerId, total]);

    useEffect(() => {
        // Nếu chưa chọn khách hàng thì tự động tính lại PGG tốt nhất
        if (total <= 0) return;
        const selectedCustomer = customers.find(c => c.idKhachHang === selectedCustomerId);
        if (!manualVoucherSelected && (!selectedCustomer || selectedCustomer?.idKhachHang === 0)) {
            const validVouchers = total > 0
                ? originalVouchers.filter(v => total >= v.dieuKien)
                : originalVouchers;

            setFilteredVouchers(validVouchers);
            const { bestVoucher, maxDiscount } = calculateBestVoucher(total, validVouchers);
            setSelectedVoucher(bestVoucher?.id || '');
            setDiscountAmount(maxDiscount);
            setLastTotal(calculateLastTotal(total, amount, maxDiscount));
            setBestVoucherApplied(true);
        }
    }, [total, selectedCustomerId]);

    //tính toán lại khi có sự thay đổi tổng tiền
    const calculateBestVoucher = (total, vouchers) => {
        let bestVoucher = null;
        let maxDiscount = 0;
        vouchers.forEach(voucher => {
            if (total >= voucher.dieuKien) {
                let discount = 0;
                if (voucher.hinhThuc === '%') {
                    discount = (total * voucher.giaTri) / 100;
                    if (discount > voucher.giaTriToiDa) discount = voucher.giaTriToiDa;
                } else if (voucher.hinhThuc === 'VNĐ') {
                    discount = voucher.giaTri;
                }

                if (discount > maxDiscount) {
                    maxDiscount = discount;
                    bestVoucher = voucher;
                }
            }
        });
        return { bestVoucher, maxDiscount };
    };

    useEffect(() => {
        const currentVoucher = filteredVouchers.find(v => v.id === selectedVoucher);

        if (manualVoucherSelected && currentVoucher) {
            // Đã chọn tay, kiểm tra xem voucher có còn hợp lệ với tổng tiền mới không
            if (total < currentVoucher.dieuKien) {
                // Không còn hợp lệ => bỏ chọn và reset
                setSelectedVoucher('');
                setDiscountAmount(0);
                setManualVoucherSelected(false);
                setBestVoucherApplied(false);
            } else {
                // Còn hợp lệ => tính lại giảm giá theo voucher đang chọn
                let discount = 0;
                if (currentVoucher.hinhThuc === '%') {
                    discount = (total * currentVoucher.giaTri) / 100;
                    if (discount > currentVoucher.giaTriToiDa) {
                        discount = currentVoucher.giaTriToiDa;
                    }
                } else if (currentVoucher.hinhThuc === 'VNĐ') {
                    discount = currentVoucher.giaTri;
                }
                setDiscountAmount(discount);
                setLastTotal(calculateLastTotal(total, amount, discount));
                setBestVoucherApplied(false); // Không phải tốt nhất do chọn tay
                return;
            }
        }

        // Nếu không chọn tay hoặc phiếu tay không hợp lệ, chọn lại phiếu tốt nhất
        const { bestVoucher, maxDiscount } = calculateBestVoucher(total, filteredVouchers);
        setSelectedVoucher(bestVoucher?.id || '');
        setDiscountAmount(maxDiscount);
        setLastTotal(calculateLastTotal(total, amount, maxDiscount));
        setBestVoucherApplied(true);
    }, [total, filteredVouchers]);

    const calculateShippingFee = async () => {
        if (!selectedWard || !selectedDistrict) return;

        try {
            const response = await api.get(
                "/admin/dia-chi/shipping-fee",
                {
                    params: {
                        districtID: selectedDistrict,
                        wardCode: selectedWard,
                        idHoaDon: invoiceId.idHoaDon
                    }
                }
            );
            if (response.status === 200) {
                setAmount(response.data);
            }
        } catch (error) {
            if (error.response) {
                console.error("Phản hồi lỗi từ API:", error.response.data);
            }
            setAmount(32000);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/hoa-don/hd-ban-hang');
            const ordersData = response.data;
            setOrders(ordersData);
            const newTabs = ordersData.map(order => ({
                id: order.idHoaDon,
                label: `Order ${order.maHoaDon}`,
            }));
            setTabs(newTabs);
            if (newTabs.length > 0) {
                setActiveTab(newTabs[0].id);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };
    const fetchCustomers = async () => {
        try {
            const response = await api.get("/admin/khach-hang/hien-thi-customer");
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };
    useEffect(() => {
        fetchCustomers();
        fetchOrders();
    }, []);

    useEffect(() => {
        const activeOrder = orders.find(o => o.idHoaDon === activeTab);
        if (activeOrder) {
            const tongTien = total || 0;
            setTotalAmount(tongTien);

            let discount = 0;
            if (activeOrder.voucher) {
                const voucher = activeOrder.voucher;
                if (voucher.hinhThuc === '%') {
                    discount = (tongTien * voucher.giaTri) / 100;
                    if (discount >= voucher.giaTriToiDa) {
                        discount = voucher.giaTriToiDa;
                    }
                } else if (voucher.hinhThuc === 'VNĐ') {
                    discount = voucher.giaTri;
                }
                setDiscountAmount(discount);
                setSelectedVoucher(voucher.id ? voucher.id : '');
            } else {
                setDiscountAmount(0);
                setSelectedVoucher('');
            }

            const activeTabData = tabs.find(tab => tab.id === activeTab);
            const selectedCustomer = customers.find(c => c.idKhachHang === selectedCustomerId);

            if (activeTabData && activeTabData.vouchers && selectedCustomer && selectedCustomer?.idKhachHang !== 0) {
                const filtered = activeTabData.vouchers.filter(v => tongTien >= v.dieuKien);
                setFilteredVouchers(filtered);
            }

            const finalTotal = Math.max(tongTien + Number(amount) - discount, 0);
            setLastTotal(finalTotal);
        } else {
            setTotalAmount(0);
            setLastTotal(0);
            setDiscountAmount(0);
            setSelectedVoucher('');
            setFilteredVouchers([]);
        }
    }, [activeTab, orders, total]);


    const reload = () => {
        // fetchCustomers();
        fetchCusAddress(selectedCustomerId);
    }

    const calculateLastTotal = (totalAmount, deliveryFee, discount) => {
        return Math.max(totalAmount + Number(deliveryFee) - discount, 0);
    };

    const applyBestVoucher = async (order, vouchers) => {
        if (!order || !vouchers?.length || total <= 0) return 0;

        const { bestVoucher, maxDiscount } = calculateBestVoucher(total, vouchers);
        if (!bestVoucher) return 0;

        try {
            await api.put(`/admin/hoa-don/update-voucher/${order.idHoaDon}`, {
                voucherId: bestVoucher.id
            });

            const updatedOrder = { ...order, voucher: bestVoucher, discountAmount: maxDiscount };
            setOrders(prevOrders => prevOrders.map(o => o.idHoaDon === order.idHoaDon ? updatedOrder : o));

            setDiscountAmount(maxDiscount);
            setSelectedVoucher(bestVoucher.id);
            setBestVoucherApplied(true);
            setInitialBestVoucherId(bestVoucher.id);

            return maxDiscount;
        } catch (error) {
            console.error('Lỗi khi áp dụng voucher:', error);
            return 0;
        }
    };

    const applySelectedVoucher = async (order, voucher) => {
        if (!order || !voucher || total === 0) return;

        const totalAmount = total || 0;
        let discount = voucher.hinhThuc === '%'
            ? Math.min((totalAmount * voucher.giaTri) / 100, voucher.giaTriToiDa)
            : voucher.giaTri;

        try {
            await api.put(`/admin/hoa-don/update-voucher/${order.idHoaDon}`, {
                voucherId: voucher.id
            });

            const updatedOrder = { ...order, voucher, discountAmount: discount };
            setOrders(prevOrders => prevOrders.map(o => o.idHoaDon === order.idHoaDon ? updatedOrder : o));

            setDiscountAmount(discount);
            setLastTotal(calculateLastTotal(total, amount, discount));
            setSelectedVoucher(voucher.id);

            const { bestVoucher } = calculateBestVoucher(total + Number(amount), filteredVouchers);
            setBestVoucherApplied(voucher.id === bestVoucher?.id);
            setManualVoucherSelected(voucher.id !== bestVoucher?.id);
        } catch (error) {
            console.error('Lỗi khi áp dụng voucher:', error);
        }
    };

    //Tìm pgg
    const searchVoucher = (keyword) => {
        const cleanedKeyword = keyword.trim().toLowerCase().replace(/\s+/g, '');

        // Nếu xóa hết, reset về danh sách gốc
        if (cleanedKeyword === '') {
            setFilteredVouchers(originalVouchers.filter(v => total >= v.dieuKien));
            setVoucherSearched(false);  // Không phải đang tìm nữa
            setManualVoucherSelected(false); // Reset chọn tay vì quay về auto tốt nhất
            applyBestVoucher(orders.find(o => o.idHoaDon === activeTab), originalVouchers); // Áp lại voucher tốt nhất
            return;
        }

        // Nếu đủ 9 ký tự mới thực hiện tìm kiếm theo yêu cầu
        if (cleanedKeyword.length === 9) {
            const filtered = originalVouchers.filter(v =>
                v.maKhuyenMai.toLowerCase().replace(/\s+/g, '').includes(cleanedKeyword) && total >= v.dieuKien
            );

            setFilteredVouchers(filtered);
            setVoucherSearched(filtered.length > 0);

            if (filtered.length === 0) {
                Notification("Không có phiếu giảm giá hoặc chưa đủ điều kiện áp dụng", "warning");
            }
        }
    };

    const getTabVouchers = () => {
        return filteredVouchers;
    };

    const handleChangeCustomer = (customerId) => {
        setSelectedCustomerId(customerId)
        fetchCusAddress(customerId)
        if (customerId === -1) {
            setDeliveryMethod("taiquay")
            setAmount(0);
        } else {
            if (deliveryMethod === "giaohang") {
                calculateShippingFee();
            }
        }
    }

    const fetchCusAddress = async (idKhachHang) => {
        if (idKhachHang) {
            try {
                await api.get(`/admin/dia-chi/get-address/${idKhachHang}`).then(res => {
                    if (res.status === 200) {
                        setAddresses(res.data);
                        setSelectedDistrict(res.data.quanHuyen);
                        setSelectedWard(res.data.xaPhuong);
                    }
                })
            } catch (error) {
                console.error("Error fetching customer address:", error);
                setAddresses([]);
                setSelectedAddress('');
            }
        }
    }
    useEffect(() => {
        if (addresses.length > 0) {
            addresses.find(address => {
                if (address.macDinh) {
                    setSelectedAddress(address.id);
                    setSelectedDistrict(address.quanHuyen);
                    setSelectedWard(address.xaPhuong);
                }
            })
        }
    }, [addresses]);

    // useEffect(() => {
    //     calculateShippingFee()
    // }, [totalItem, selectedDistrict, selectedWard]);
    const handleChangeAddress = async (addressId) => {
        try {
            setSelectedAddress(addressId);
            await api.get(`/admin/dia-chi/set-default-address/${addressId}`).then(res => {
                if (res.status === 200) {
                    Notification("Đặt địa chỉ mặc định thành công!", "success")
                    fetchCusAddress(selectedCustomerId);
                } else {
                    Notification("Đặt địa chỉ mặc định thất bại!", "error")
                }
            });
        } catch (error) {
            console.error("Error setting default address:", error);
            Notification("Đặt địa chỉ mặc định thất bại!", "error")
        }
    }

    const handlePrint = (invoiceData, listItems, hoTenKhach) => {
        const printWindow = window.open('', '', 'width=800,height=600');

        printWindow.document.write(`
          <html>
          <head>
            <style>
              body { font-family: "Arial", sans-serif; padding: 20px; text-align: center; }
              .invoice-container { max-width: 350px; margin: auto; padding: 15px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: left; }
              .shop-logo { width: 80px; display: block; margin: 0 auto 10px; }
              h2 { margin-bottom: 5px; font-size: 18px; text-align: center; }
              h3 { font-size: 16px; margin-bottom: 10px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
              th, td { border-bottom: 1px dashed #000; padding: 6px; }
              th { background-color: #f2f2f2; text-align: left; }
              .total-row, .info-row { display: flex; justify-content: space-between; font-size: 14px; margin: 5px 0; }
              .total { font-weight: bold; font-size: 16px; }
              .footer { margin-top: 15px; font-size: 12px; font-style: italic; text-align: center; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <img src="/logo.png" alt="Cenndii Shop Logo" class="shop-logo" />
              <h2>CENNDII SHOP</h2>
              <h3>HÓA ĐƠN BÁN HÀNG</h3>
              
              <div class="info-row"><strong>Mã hóa đơn:</strong> <span>${invoiceData.maHoaDon}</span></div>
              <div class="info-row"><strong>Khách hàng:</strong> <span>${hoTenKhach || "Khách lẻ"}</span></div>
              <div class="info-row"><strong>Ngày:</strong> <span>${new Date().toLocaleString()}</span></div>
              
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${listItems?.map(item => `
                    <tr>
                      <td>${item.tenSanPham}</td>
                      <td>${item.soLuongMua}</td>
                      ${item.giaDuocTinh != item.giaBan ? `<td>${item.giaDuocTinh} VND</td>` : `<td>${item.donGia} VND</td>`}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="total-row"><strong>Tổng cộng:</strong> <span>${invoiceData.tongTien} VND</span></div>
              <div class="total-row"><strong>Phí vận chuyển:</strong> <span>${invoiceData.phiVanChuyen} VND</span></div>
              <div class="total-row"><strong>Ghi chú:</strong> <span>${invoiceData.ghiChu}</span></div>
              <p class="footer">Cảm ơn quý khách đã mua hàng tại Cenndii Shop!</p>
            </div>
          </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    ///////----
    useEffect(() => {
        if (!invoiceId || !invoiceId.idHoaDon) return;

        //  Hủy hoàn toàn nếu hóa đơn không còn active (tránh setTimeout luôn)
        if (invoiceId.idHoaDon !== activeOrderId) {
            console.log(" [Hủy trước timeout] Hóa đơn không còn active, bỏ gửi:", invoiceId.idHoaDon);
            return;
        }

        const timeout = setTimeout(() => {
            if (!window.stompClient?.connected) {
                console.warn(" Không gửi được socket - chưa kết nối?");
                return;
            }

            const tabStillExists = tabs.some(tab => tab.id === invoiceId.idHoaDon);
            if (!tabStillExists) {
                console.log(" Hóa đơn không còn trong danh sách tab:", invoiceId.idHoaDon);
                return;
            }

            const payload = {
                idHoaDon: invoiceId.idHoaDon,
                tongTienSauCung: lastTotal,
                soTienGiam: discountAmount,
            };

            console.log(" Gửi socket (sau timeout):", payload);
            window.stompClient.publish({
                destination: "/app/switch-invoice",
                body: JSON.stringify(payload),
            });
        }, 200);

        return () => clearTimeout(timeout);
    }, [lastTotal, discountAmount, invoiceId?.idHoaDon, activeOrderId, tabs]);

    ///////////---------

    return (
        <div>
            <div
                className="h-[600px] flex flex-col justify-between"
                style={{
                    maxWidth: "100%",
                    margin: "auto",
                    padding: "20px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                }}
            >
                <h2 className="font-semibold mb-2">Thông tin khách hàng</h2>
                <Box sx={{ p: 1, borderRadius: 1, border: '1px solid #ccc' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormHelperText sx={{ fontSize: 14, color: 'black' }}>
                            Chọn khách hàng và địa chỉ giao hàng
                        </FormHelperText>
                        <FormControl>
                            <InputLabel
                                id="customer-select"
                                sx={{
                                    fontSize: 12,
                                    paddingTop: '5px',
                                    minWidth: 300,
                                }}
                            >
                                Khách hàng
                            </InputLabel>
                            <Select
                                labelId="customer-select"
                                value={selectedCustomerId ?? ""}
                                label="Khách hàng"
                                onChange={e => {
                                    handleChangeCustomer(e.target.value)
                                }}
                                size="small"
                                sx={{ fontSize: 12, width: "100%" }}
                            >
                                <MenuItem key={-1} value={-1}>
                                    Khách lẻ
                                </MenuItem>
                                {customers.map((customer) => (
                                    <MenuItem key={customer.idKhachHang} value={customer.idKhachHang}>
                                        {customer.hoTen}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedCustomerId !== -1 && (
                            <FormControl>
                                <InputLabel
                                    id="address-select"
                                    sx={{
                                        fontSize: 12,
                                        paddingTop: '5px',
                                        minWidth: 300,
                                    }}
                                >
                                    Địa chỉ
                                </InputLabel>
                                <Select
                                    labelId="address-select"
                                    value={selectedAddress ?? ""}
                                    label="Địa chỉ"
                                    onChange={e => handleChangeAddress(e.target.value)}
                                    size="small"
                                    sx={{ fontSize: 10, width: "100%" }}
                                >
                                    {addresses.map((address) => (
                                        <MenuItem key={address.id} value={address.id}>
                                            {address.diaChiChiTiet}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {selectedCustomerId !== -1 && (
                            <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 1 }}>
                                <Button variant="contained" color="primary" size='small' onClick={e => setOpenUpdateAddressDialog(true)}>Sửa địa chỉ</Button>
                                <Button variant="contained" color="primary" size='small' onClick={e => setOpenAddAddressDialog(true)}>Thêm địa chỉ</Button>
                            </Box>
                        )}
                    </Box>
                </Box>
                <UpdateCustomerAddress open={openUpdateAddressDialog} onClose={handleCloseUpdateAddressDialog} selectedAddress={addresses.find(a => a.id === selectedAddress)} />
                <AddressDialog idKhachHang={selectedCustomerId} open={openAddAddressDialog} onClose={handleCloseAddressDialog} />
                <div className="flex justify-content-center gap-x-6 ">
                    <label className="flex justify-content-center gap-x-2">
                        <input
                            type="radio"
                            value="taiquay"
                            checked={deliveryMethod === "taiquay"}
                            readOnly
                            onClick={() => {
                                setDeliveryMethod("taiquay");
                                setAmount(0);  // Tại quầy thì không có phí ship
                            }}
                        />
                        <span>Tại quầy</span>
                    </label>

                    <label className="flex justify-content-center gap-x-2">
                        <input
                            type="radio"
                            value="giaohang"
                            checked={deliveryMethod === "giaohang"}
                            readOnly
                            onClick={() => {
                                setDeliveryMethod("giaohang");
                                if (selectedCustomerId !== -1) {
                                    calculateShippingFee();
                                } else {
                                    setOpenDeliveryForm(true);
                                }
                            }}
                        />
                        <span>Giao Hàng</span>
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Hãy nhập mã phiếu có 9 ký tự"
                        className="border p-2 rounded flex-1"
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value);
                            searchVoucher(e.target.value);
                        }}
                    />
                </div>

                <div className="p-4 rounded-lg border border-gray-300 max-h-60 overflow-y-auto">
                    <div className="flex items-center space-x-2 text-gray-700 font-medium">
                        <Ticket size={18} />
                        <span>Phiếu giảm giá</span>
                    </div>
                    {getTabVouchers().length > 0 ? (<select
                        className="border p-2 rounded w-full"
                        value={selectedVoucher || ''}
                        onChange={(e) => {
                            const selectedVoucherId = parseInt(e.target.value);
                            const selectedVoucher = getTabVouchers().find(v => v.id === selectedVoucherId);
                            const activeOrder = orders.find(o => o.idHoaDon === activeTab);
                            setSelectedVoucher(selectedVoucherId);
                            setManualVoucherSelected(true); // Đánh dấu là người dùng chọn tay

                            if (selectedVoucher && activeOrder) {
                                applySelectedVoucher(activeOrder, selectedVoucher);
                            }
                        }}
                    >
                        {getTabVouchers()
                            .sort((a, b) => {
                                const calculateDiscount = (voucher, total) => {
                                    if (voucher.hinhThuc === '%') {
                                        const discount = (total * voucher.giaTri) / 100;
                                        return Math.min(discount, voucher.giaTriToiDa);
                                    } else if (voucher.hinhThuc === 'VNĐ') {
                                        return voucher.giaTri;
                                    }
                                    return 0;
                                };

                                const discountA = calculateDiscount(a, lastTotal);
                                const discountB = calculateDiscount(b, lastTotal);
                                return discountB - discountA;
                            })
                            .map((voucher) => (
                                <option key={voucher.id} value={voucher.id}>
                                    {voucher.maKhuyenMai} - {voucher.giaTri.toLocaleString({ style: 'currency', currency: 'VND' })} {voucher.hinhThuc}
                                    {voucher.hinhThuc === '%' && ` - Tối đa ${voucher.giaTriToiDa.toLocaleString({ style: 'currency', currency: 'VND' })} VNĐ`}
                                </option>
                            ))
                        }
                    </select>) : (<p className="text-red-500">Không có phiếu giảm giá phù hợp.</p>)}
                    {getTabVouchers().length > 0 && bestVoucherApplied && !voucherSearched && total > 0 && (
                        <p className="text-red-500 italic text-sm mt-2">
                            * Phiếu giảm giá có giá trị tốt nhất.
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-between w-full">
                    <div>Hình thức thanh toán:</div>
                    <div className="flex items-center gap-4">
                        <label className="flex justify-content-center">
                            <input
                                type="radio"
                                value="tienmat"
                                checked={paymentMethod === "tienmat"}
                                onChange={() => setPaymentMethod("tienmat")}
                            />
                            <span>Tiền mặt</span>
                        </label>
                        <label className="flex justify-content-center">
                            <input
                                type="radio"
                                value="chuyenkhoan"
                                checked={paymentMethod === "chuyenkhoan"}
                                onChange={() => setPaymentMethod("chuyenkhoan")}
                            />
                            <span>Chuyển khoản</span>
                        </label>
                        <label className="flex justify-content-center">
                            <input
                                type="radio"
                                value="cahai"
                                checked={paymentMethod === "cahai"}
                                onChange={() => setPaymentMethod("cahai")}
                            />
                            <span>Cả hai</span>
                        </label>
                    </div>
                </div>
                {paymentMethod === "cahai" && (
                    <div className="flex items-center gap-4">
                        <div>
                            <label>Tiền mặt:</label>
                            <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1px solid #ccc" }}
                            />
                        </div>
                        <div>
                            <label>Chuyển khoản:</label>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                            />
                        </div>
                    </div>
                )}
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <div className=" p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Tổng tiền:</span>
                            <span className="font-semibold text-gray-900">{total.toLocaleString()} đ</span>
                        </div>
                        {deliveryMethod === "giaohang" && (
                            <div className="flex items-center justify-between w-full">

                                <div className="flex items-center gap-2">
                                    <label>Phí vận chuyển:</label>
                                    <img
                                        src="https://product.hstatic.net/1000405368/product/giao_hang_nhanh_toan_quoc_color.b7d18fe5_39425b03ee544ab2966d465756a00f89_small.png"
                                        alt="Giao Hàng Nhanh"
                                        className="w-24 h-12"
                                    />
                                </div>
                                <div className="text-red-500">
                                    <span className=""> + </span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            if (e.target.value >= 0) {
                                                setAmount(e.target.value)
                                            } else {
                                                setAmount(0)
                                            }
                                        }}
                                        className="p-2 h-4 w-20 text-right border border-gray-300 rounded"
                                    />
                                    <span className="text-red-500"> đ </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Số tiền giảm:</span>
                            <span className="text-red-500 font-semibold">-{discountAmount.toLocaleString()} đ</span>
                        </div>
                        <hr className="border-t border-dashed border-gray-300" />
                        <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-lg text-gray-800">Tổng tiền sau giảm:</span>
                            <span className="text-xl font-bold text-red-600">
                                {(lastTotal).toLocaleString()} đ
                            </span>
                        </div>
                    </div>
                </div>
                {(paymentMethod === "chuyenkhoan" || paymentMethod === "cahai") && waitingTransferConfirm ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button
                            onClick={() => handleSubmit(onSubmit)()}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#43A047",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            Xác nhận đã chuyển khoản
                        </button>

                        <button
                            onClick={resendQrToApp}
                            style={{
                                padding: "8px 20px",
                                backgroundColor: "#FFC107",
                                color: "#333",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            Gửi lại mã QR
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleOpenPayAlert}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            width: "100%",
                        }}
                    >
                        Thanh Toán
                    </button>
                )}

                {/* <button
                    type="button"
                    onClick={handleOpenPayAlert}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        width: "100%",
                    }}
                >
                    Thanh Toán
                </button> */}
            </div>
            <Delivery
                open={openDeliveryForm}
                onClose={() => setOpenDeliveryForm(false)}
                onShippingFeeUpdate={handleShippingFeeUpdate}
            />
            <Alert
                message={"Xác nhận thanh toán ?"}
                open={openPayAlert}
                onClose={getConfirm}
            />
        </div>
    );
};

export default DeliveryForm;