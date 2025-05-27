import React, { useEffect, useState } from "react";
import { Row, Col, Button, Card, Table, Tooltip, message } from "antd";
import StatisticWidget from "../../components/StatisticWidget";
import ChartWidget from "../../components/ChartWidget";
import PieChartWidget from "../../components/PieChartWidget";
import { formatCurrency } from "../../utils/formatCurrency";
import User from "../../assets/teamwork.png";
import Order from "../../assets/shopping-bag.png";
import Product from "../../assets/best-seller.png";
import COD from "../../assets/cash-on-delivery.png";
import moment from "moment"; // Import moment for date formatting
import api from "../../../security/Axios";
import { hasPermission } from "../../../security/DecodeJWT";


const generateStatus = (status) => {
    let color = "";
    switch (status) {
        case "Chờ xác nhận":
            color = "#FF9900";
            break;
        case "Đã xác nhận":
            color = "#0000FF";
            break;
        case "Chờ vận chuyển":
            color = "#800080";
            break;
        case "Đang vận chuyển":
            color = "#008000";
            break;
        case "Đã hoàn thành":
            color = "#008080";
            break;
        case "Hủy":
            color = "#FF0000";
            break;
        default:
            color = "gray";
    }
    return (
        <span
            style={{
                color: color,
                padding: "3px 8px",
                border: `1px solid ${color}`,
                borderRadius: "5px",
                backgroundColor: `${color}20`,
                textAlign: "center",
                display: "inline-block",
            }}
        >
            {status}
        </span>
    );
};

const formatDate = (date) => date.toISOString().slice(0, 10);

export const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState({});
    const [dailyData, setDailyData] = useState({});
    const [trendingProducts, setTrendingProducts] = useState([]);

    const [startDate, setStartDate] = useState(moment().subtract(1, "months"));
    const [endDate, setEndDate] = useState(moment().add(1, "days"));


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, revenueRes, productsRes] = await Promise.all([
                api.get("/admin/dashboard/orders/recent"),
                api.get("/admin/dashboard/revenue/statistics"),
                api.get("/admin/dashboard/products/low-stock"),
            ]);
            setOrders(ordersRes.data);
            setRevenue(revenueRes.data);
            setTrendingProducts(productsRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard", error);
            message.error("Lỗi khi tải dữ liệu dashboard");
        }
    };

    const handleFetchRevenue = async () => {
        try {
            const res = await api.get(
                `/admin/dashboard/revenue/daily?start=${formatDate(startDate)}&end=${formatDate(endDate)}`
            );
            setDailyData(res.data);
        } catch (error) {
            console.error("Lỗi khi tính doanh thu", error);
            message.error("Lỗi khi tính doanh thu");
        }
    };

    const columns = [
        {
            title: "Mã Đơn Hàng",
            dataIndex: "code",
        },
        {
            title: "Người Mua",
            dataIndex: "userFullName",
        },
        {
            title: "Số Điện Thoại",
            dataIndex: "userPhone",
        },
        {
            title: "Email",
            dataIndex: "userEmail",
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: 150 }}>
                        {text}
                    </span>
                </Tooltip>
            )
        },
        {
            title: "Ngày Đặt",
            dataIndex: "date",
            render: (dateArr) => {
                if (Array.isArray(dateArr) && dateArr.length >= 3) {
                    const dateObj = new Date(
                        dateArr[0],               // year
                        dateArr[1] - 1,           // month (JS đếm từ 0)
                        dateArr[2],               // day
                        dateArr[3] || 0,          // hour
                        dateArr[4] || 0,          // minute
                        dateArr[5] || 0,          // second
                        Math.floor((dateArr[6] || 0) / 1000000)
                    );
                    return moment(dateObj).format("DD/MM/YYYY HH:mm:ss");
                }
                return "Không xác định";
            },
        },

        {
            title: "Loại Đơn",
            dataIndex: "paymentMethod",
        },
        {
            title: "Tổng Giá",
            dataIndex: "totalPrice",
            render: (text) => `${formatCurrency(text)}`,
        },
        {
            title: "Trạng Thái",
            dataIndex: "status",
            render: (status) => generateStatus(status),
        },
    ];

    const trendingColumns = [
        {
            title: "Ảnh",
            dataIndex: "image",
            render: (image) => (
                <img
                    src={image}
                    alt="Giày"
                    style={{ width: 50, height: 50, borderRadius: "8px" }}
                />
            ),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
        },
        {
            title: "Kích cỡ",
            dataIndex: "size",
        },
        {
            title: "Còn lại",
            dataIndex: "sold",
            render: (sold) => <span>{sold} đôi</span>,
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price) => (
                <span>{new Intl.NumberFormat("vi-VN").format(price)} đ</span>
            ),
        },
    ];
    const pieChartData = {
        series: [45, 32, 18, 25, 22],
        labels: ["Giày thể thao", "Giày da", "Sandal", "Giày cao gót", "Giày lười"],
    };




    return (
        <Card >
            <Row gutter={16} marginBottom={10}>
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Row gutter={16}>
                        {/* Displaying Revenue Widgets */}
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Tổng số sản phẩm đang bán"}
                                value={`${revenue?.totalProducts} sản phẩm`}
                                imgSrc={Product}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Đơn hàng đã hoàn thành"}
                                value={`${revenue?.totalOrders} đơn hàng`}
                                imgSrc={Order}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Tổng số người dùng"}
                                value={`${revenue?.totalUsers} người dùng`}
                                imgSrc={User}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        {/* Displaying Revenue Widgets */}
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Doanh thu hôm nay"}
                                value={
                                    formatCurrency(revenue?.todayRevenue) ?? formatCurrency(0)
                                }
                                status={revenue?.todayIncreasePercentage}
                                subtitle={`So với hôm qua (${formatCurrency(
                                    revenue?.yesterdayRevenue
                                )})`}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Doanh thu tháng này"}
                                value={
                                    formatCurrency(revenue?.monthlyRevenue) ?? formatCurrency(0)
                                }
                                status={revenue?.monthlyIncreasePercentage}
                                subtitle={`So với tháng trước (${formatCurrency(
                                    revenue?.lastMonthRevenue
                                )})`}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                            <StatisticWidget
                                title={"Doanh thu năm"}
                                value={
                                    formatCurrency(revenue?.yearlyRevenue) ?? formatCurrency(0)
                                }
                                status={revenue?.yearlyIncreasePercentage}
                                subtitle={`So với năm ngoái (${formatCurrency(
                                    revenue?.lastYearRevenue
                                )})`}
                            />
                        </Col>
                    </Row>

                    {/* Date pickers and button for calculating revenue */}
                    <Row gutter={16} style={{ marginBottom: "20px", marginTop: "20px" }}>
                        <Col xs={24} sm={12} md={8}>
                            <input
                                type="date"
                                value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                                onChange={e => setStartDate(new Date(e.target.value))}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    transition: "all 0.3s",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                onFocus={e =>
                                    (e.target.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)")
                                }
                                onBlur={e => (e.target.style.boxShadow = "none")}
                                onMouseOver={e => (e.target.style.borderColor = "#4096ff")}
                                onMouseOut={e => (e.target.style.borderColor = "#d9d9d9")}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <input
                                type="date"
                                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                                onChange={e => setEndDate(new Date(e.target.value))}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    transition: "all 0.3s",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                onFocus={e =>
                                    (e.target.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)")
                                }
                                onBlur={e => (e.target.style.boxShadow = "none")}
                                onMouseOver={e => (e.target.style.borderColor = "#4096ff")}
                                onMouseOut={e => (e.target.style.borderColor = "#d9d9d9")}
                            />
                        </Col>

                        <Col xs={24} sm={24} md={8}>
                            <Button type="primary" onClick={handleFetchRevenue}>
                                Tính doanh thu
                            </Button>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
                            <ChartWidget
                                title="Doanh thu theo ngày"
                                series={dailyData?.series}
                                xAxis={dailyData?.categories}
                                height={400}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Card title="Sản phẩm sắp hết hàng">
                                <Table
                                    style={{ height: 360, overflow: "auto" }}
                                    columns={trendingColumns}
                                    dataSource={trendingProducts}
                                    pagination={false}
                                    rowKey={(record) => record.productId}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "32px" }}>
                <Col span={24}>
                    <Card title="Đơn hàng gần nhất">
                        <Table
                            columns={columns}
                            dataSource={orders}
                            pagination={false}
                            rowKey={(record) => record.orderId}
                            scroll={{ x: "max-content" }}
                        />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default Dashboard;
