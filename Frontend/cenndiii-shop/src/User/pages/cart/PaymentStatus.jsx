import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, Typography, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect } from "react";
import api from "../../../security/Axios";
import { useCart } from "../cart/CartContext";

export default function PaymentStatus() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount, setCartCount } = useCart();
    const token = localStorage.getItem("token");


    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get("vnp_ResponseCode");
    const txnRef = queryParams.get("vnp_TxnRef");
    const transactionNo = queryParams.get("vnp_TransactionNo");
    const payDate = queryParams.get("vnp_PayDate");
    const success = responseCode === "00";

    useEffect(() => {
        const sendPaymentData = async () => {
            if (success) {
                try {
                    const orderData = JSON.parse(localStorage.getItem("orderData"));
                    if (!orderData) {
                        console.error("Không tìm thấy dữ liệu đơn hàng");
                        return;
                    }

                    const response = await api.post("/admin/hoa-don/payment-status", orderData, {
                        params: {
                            txnRef: txnRef,
                            transactionNo: transactionNo,
                            payDate: payDate
                        }
                    });
                    if (response.status === 200) {
                        // Xóa dữ liệu đơn hàng khỏi localStorage sau khi gửi thành công
                        localStorage.removeItem("orderData");
                        await fetch("http://localhost:8080/api/cart/clear", {
                            method: "POST",
                            credentials: "include",
                            // headers: { ...(token && { "Authorization": `Bearer ${token}` }) }
                        });

                        setCartCount(prev => prev === 0);
                    }

                } catch (error) {
                    console.error("Lỗi khi gửi dữ liệu thanh toán:", error);
                }
            }
        };

        sendPaymentData();
    }, [success, txnRef, transactionNo, payDate]);

    return (
        <div className="payment-container">
            <Card className="payment-card">
                <CardHeader title={
                    success ? "Thanh toán thành công!" :
                        "Thanh toán thất bại!"
                } className="payment-header" />
                <CardContent>
                    {success ? (
                        <CheckCircleIcon color="success" className="payment-icon" />
                    ) : (
                        <CancelIcon color="error" className="payment-icon" />
                    )}

                    <Typography variant="body1" className="payment-message">
                        {success
                            ? "Cảm ơn bạn đã mua hàng của chúng tôi 💖"
                            : "Thanh toán không thành công, vui lòng thử lại"}
                    </Typography>

                    <button
                        className={`payment-button ${success ? "success" : "error"}`}
                        onClick={() => navigate("/home", { state: { success } })}
                    >
                        {success ? "Tiếp tục" : "Thử lại"}
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}