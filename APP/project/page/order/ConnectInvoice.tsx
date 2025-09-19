import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import api from '../login/api';
import Modal from 'react-native-modal';

const ConnectInvoice = () => {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tongTienCuoiCung, setTongTienCuoiCung] = useState<number | null>(null);
    const [soTienGiam, setSoTienGiam] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [qrCountdown, setQrCountdown] = useState(180); // 180 giây = 3 phút


    const fetchInvoiceDetails = async (idHoaDon: number) => {
        try {
            const invoiceRes = await api.get(`/admin/hoa-don/HoaDon/${idHoaDon}`);
            const itemsRes = await api.get(`/admin/hdct/get-cart/${idHoaDon}`);
            setSelectedInvoice(invoiceRes.data);
            setSelectedInvoiceItems(itemsRes.data);
        } catch (err) {
            console.error(' Lỗi khi lấy chi tiết hóa đơn:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://10.0.2.2:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Kết nối WebSocket thành công');
                client.subscribe('/topic/invoice-tracking', async (message) => {
                    const data = JSON.parse(message.body);
                    if (data.idHoaDon) {
                        fetchInvoiceDetails(data.idHoaDon);

                        if (data.tongTienSauCung !== undefined) {
                            setTongTienCuoiCung(data.tongTienSauCung);
                        }
                        if (data.soTienGiam !== undefined) {
                            setSoTienGiam(data.soTienGiam);
                        }

                        if (data.paymentType === "chuyenkhoan") {
                            try {
                                const qrResponse = await api.post(`/api/vietqr/create`, {
                                    invoiceId: data.idHoaDon,
                                    tongTienSauCung: data.tongTienSauCung, // vẫn giữ nếu app dùng hiển thị
                                    soTienChuyenKhoan: data.soTienChuyenKhoan // Gửi đúng tên field mới
                                });
                                const qrUrl = qrResponse.data.qrUrl;
                                setQrUrl(qrUrl);
                                setShowQR(true);
                            } catch (error) {
                                console.error(" Không lấy được mã QR:", error);
                            }
                        }
                    }
                });

                client.subscribe('/topic/invoice-paid', (message) => {
                    const data = JSON.parse(message.body);
                    const msg = data.message || "Hóa đơn đã được thanh toán";

                    // Ẩn mã QR ngay
                    setShowQR(false);
                    setQrUrl('');

                    // Hiển thị thông báo
                    setModalMessage(msg);
                    setIsModalVisible(true);

                    setTimeout(() => {
                        setIsModalVisible(false);
                    }, 3000);
                });

            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    //  Tự động ẩn mã QR sau 3 phút
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;

        if (showQR) {
            setQrCountdown(180); // đặt lại mỗi lần QR hiện

            countdownInterval = setInterval(() => {
                setQrCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        setShowQR(false);
                        setQrUrl('');
                        setModalMessage("Mã QR đã hết hạn.");
                        setIsModalVisible(true);
                        setTimeout(() => {
                            setIsModalVisible(false);
                        }, 3000);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(countdownInterval);
    }, [showQR]);


    if (!selectedInvoice) {
        return (
            <View style={styles.container2}>
                <Text style={styles.nulloder}>Chưa có hóa đơn nào được chọn</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.invoiceCode}>HÓA ĐƠN: {selectedInvoice.maHoaDon}</Text>

            <View style={styles.productBox}>
                <FlatList
                    data={selectedInvoiceItems}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Image source={{ uri: item.lienKet }} style={styles.image} />
                            <View style={styles.itemInfo}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{item.tenSanPham}</Text>
                                    <Text style={styles.text}>Kích cỡ: {item.tenKichCo}</Text>
                                    <Text style={styles.text}>Số lượng: {item.soLuongMua}</Text>
                                </View>
                                <Text style={styles.price}>
                                    {typeof item.thanhTien === 'number' ? `${item.thanhTien.toLocaleString()} đ` : ''}
                                </Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>Hóa đơn chưa có sản phẩm.</Text>}
                />
            </View>

            <View style={styles.summaryBox}>
                {soTienGiam !== null && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Giảm giá:</Text>
                        <Text style={styles.discount}>{`-${soTienGiam.toLocaleString()} đ`}</Text>
                    </View>
                )}

                {tongTienCuoiCung !== null && (
                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Tổng cần thanh toán:</Text>
                        <Text style={styles.finalAmount}>{`${tongTienCuoiCung.toLocaleString()} đ`}</Text>
                    </View>
                )}

                <Modal isVisible={showQR} backdropOpacity={0.8}>
                    <View style={styles.qrModal}>
                        <Text style={styles.qrTitle}> Mở ứng dụng ngân hàng quét mã QR để thanh toán</Text>
                        {qrUrl !== '' && (
                            <Image
                                source={{ uri: qrUrl }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.qrCountdown}>
                            Thời gian còn lại: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')} phút
                        </Text>
                    </View>
                </Modal>

            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>{modalMessage}</Text>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container2: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
    invoiceCode: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 40, color: '#333' },
    summaryBox: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff3f3', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ffcccc', marginBottom: 20, marginHorizontal: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 16, color: '#333' },
    labelTotal: { fontSize: 18, color: '#000', fontWeight: 'bold' },
    discount: { fontSize: 16, color: '#009688', fontWeight: '500' },
    finalAmount: { fontSize: 18, color: '#e53935', fontWeight: 'bold' },
    nulloder: { fontSize: 18, color: '#666', textAlign: 'center', fontWeight: '500' },
    container: { flex: 1, backgroundColor: '#f6f6f6', padding: 16, paddingBottom: 120 },
    productBox: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderColor: '#ccc', borderWidth: 1, marginBottom: 20 },
    item: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 12, borderColor: '#ccc', borderWidth: 1 },
    image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
    itemInfo: { flex: 1, paddingLeft: 12, justifyContent: 'space-between', flexDirection: 'row' },
    name: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    text: { fontSize: 13, color: '#666' },
    empty: { textAlign: 'center', fontStyle: 'italic', color: '#888' },
    price: { fontSize: 14, fontWeight: 'bold', color: '#d32f2f', position: 'absolute', bottom: 8, right: 12, textAlign: 'right' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    modalText: { fontSize: 18, color: '#333' },
    qrModal: { backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', },
    qrTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333', textAlign: 'center', },
    qrImage: { width: 240, height: 240, borderRadius: 12, },
    qrCountdown: { marginTop: 16, fontSize: 16, color: '#e53935', fontWeight: 'bold', },
});

export default ConnectInvoice;
