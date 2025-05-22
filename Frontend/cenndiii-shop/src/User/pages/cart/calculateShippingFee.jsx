import axios from "axios";

const GHN_HEADERS = {
    token: "a9cd42d9-f28a-11ef-a268-9e63d516feb9",
    "Content-Type": "application/json",
};

const validateAddressCodes = async (provinceId, districtId, wardCode) => {
    console.log(provinceId, districtId, wardCode)
    try {
        const [provinceRes, districtRes, wardRes] = await Promise.all([
            axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", { headers: GHN_HEADERS }),
            axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", { headers: GHN_HEADERS, params: { province_id: provinceId } }),
            axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward", { headers: GHN_HEADERS, params: { district_id: districtId } })
        ]);

        const province = provinceRes.data.data.find(p => p.ProvinceID == provinceId);
        const district = districtRes.data.data.find(d => d.DistrictID == districtId);
        const ward = wardRes.data.data.find(w => w.WardCode == wardCode);

        if (!province || !district || !ward) {
            throw new Error("Invalid address codes");
        }

        return { province, district, ward };
    } catch (error) {
        console.error("Lỗi khi xác minh mã địa chỉ:", error.message);
        throw error;
    }
};

export const calculateShippingFee = async (addressCode, cartItems) => {
    const [provinceId, districtId, wardCode] = addressCode.split(", ").map(code => code.trim());
    console.log(cartItems);
    const shopId = 1542; // ID cửa hàng của bạn trên GHN (thay đổi nếu cần)

    // Tính toán kích thước và trọng lượng giống như backend
    let length = 0;
    let width = 0;
    let height = 0;
    let weight = 0;

    // Tạo danh sách items tương tự như backend
    const items = cartItems.map(item => {
        const itemLength = 20;
        const itemWidth = 20;
        const itemHeight = 12;
        const itemWeight = 1000; // 1kg mỗi sản phẩm

        length += itemLength;
        width += itemWidth;
        height += itemHeight * item.soLuong;
        weight += itemWeight * item.soLuong;

        return {
            name: item.tenSanPham,
            quantity: item.soLuong,
            length: itemLength,
            width: itemWidth,
            height: itemHeight,
            weight: itemWeight
        };
    });

    // Tính tổng giá trị đơn hàng

    try {
        await validateAddressCodes(provinceId, districtId, wardCode); // Xác minh mã địa chỉ

        const requestData = {
            from_district_id: shopId,
            from_ward_code: "1A0607", // Mã phường/xã của shop
            service_type_id: 2,
            to_district_id: Number(districtId),
            to_ward_code: wardCode,
            weight: weight,
            length: length,
            width: width,
            height: height,
            insurance_value: 0,
            items: items
        };

        const response = await axios.post(
            "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
            requestData,
            { headers: GHN_HEADERS }
        );

        console.log("API response:", response.data);
        return response.data.data.total;
    } catch (error) {
        console.error("Lỗi khi tính phí vận chuyển:", error);
        return 34000; // Thiết lập phí vận chuyển mặc định là 34,000 VND khi xảy ra lỗi
    }
};
export default calculateShippingFee;