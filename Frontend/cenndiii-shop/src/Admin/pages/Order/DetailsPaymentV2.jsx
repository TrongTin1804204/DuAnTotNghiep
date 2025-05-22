import { Select, MenuItem, Box, FormControl, InputLabel, Button, IconButton, FormHelperText, TextField } from "@mui/material";
import api from "../../../security/Axios";
import { useState, useEffect } from "react";
import Notification from "../../../components/Notification";
import AddressDialog from "./AddCusstomerAddress";
import UpdateCustomerAddress from "./UpdateCustomerAddress";
export default function DetailPaymentsV2({ invoiceId, reloadTab }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(-1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState();
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


    const reload = () => {
        fetchCustomers();
        fetchCusAddress(selectedCustomer);
    }

    const fetchCustomers = async () => {
        try {
            const response = await api.get("/admin/khach-hang/hien-thi-customer");
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };
    useEffect(() => {
        if (addresses.length > 0) {
            addresses.find(address => {
                if (address.macDinh) {
                    setSelectedAddress(address.id);
                }
            })
        }
    }, [addresses]);
    const fetchCusAddress = async (idKhachHang) => {
        if (idKhachHang) {
            try {
                await api.get(`/admin/dia-chi/get-address/${idKhachHang}`).then(res => {
                    if (res.status === 200) {
                        setAddresses(res.data);
                        console.log(res.data);
                    }
                })
            } catch (error) {
                console.error("Error fetching customer address:", error);
                setAddresses([]);
                setSelectedAddress('');
            }
        }
    }


    const handleChangeAddress = async (addressId) => {
        try {
            setSelectedAddress(addressId);
            await api.get(`/admin/dia-chi/set-default-address/${addressId}`).then(res => {
                if (res.status === 200) {
                    Notification("Đặt địa chỉ mặc định thành công!", "success")
                    fetchCusAddress(selectedCustomer);
                } else {
                    Notification("Đặt địa chỉ mặc định thất bại!", "error")
                }
            }
            );
        } catch (error) {
            console.error("Error setting default address:", error);
            Notification("Đặt địa chỉ mặc định thất bại!", "error")
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, [selectedCustomer]);

    const handleChangeCustomer = (customerId) => {
        setSelectedCustomer(customerId)
        fetchCusAddress(customerId)
    }

    return (
        <Box sx={{ p: 1, borderRadius: 1, border: '1px solid #ccc' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormHelperText sx={{ fontSize: 14, color: 'black' }}>
                    Chọn khách hàng và địa chỉ giao hàng
                </FormHelperText>
                <FormControl >
                    <InputLabel
                        id="customer-select"
                        sx={{
                            fontSize: 12,
                            paddingTop: '5px', // đẩy xuống để label không bị chạm
                            minWidth: 300,       // hoặc set chiều rộng để chữ không bị tràn
                        }}
                    >
                        Khách hàng
                    </InputLabel>
                    <Select
                        labelId="customer-select"
                        value={selectedCustomer ?? ""}
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
                            <MenuItem key={customer.idKhachHang} value={customer.idKhachHang} >
                                {customer.hoTen}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedCustomer !== -1 && (
                    <FormControl >
                        <InputLabel
                            id="address-select"
                            sx={{
                                fontSize: 12,
                                paddingTop: '5px', // đẩy xuống để label không bị chạm
                                minWidth: 300,       // hoặc set chiều rộng để chữ không bị tràn
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

                )
                }

                {selectedCustomer !== -1 && (
                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 1 }}>
                        <Button variant="contained" color="primary" size='small' onClick={e => setOpenUpdateAddressDialog(true)}>Sửa địa chỉ</Button>
                        <Button variant="contained" color="primary" size='small' onClick={e => setOpenAddAddressDialog(true)}>Thêm địa chỉ</Button>
                    </Box>
                )}

            </Box>
            <UpdateCustomerAddress open={openUpdateAddressDialog} onClose={handleCloseUpdateAddressDialog} selectedAddress={addresses.find(a => a.id === selectedAddress)} />
            <AddressDialog idKhachHang={selectedCustomer} open={openAddAddressDialog} onClose={handleCloseAddressDialog} />
        </Box >
    );
}
