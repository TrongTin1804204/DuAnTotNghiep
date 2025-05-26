// Cấu hình tên hiển thị cho các routes trong admin
export const adminRouteNames = {
    // Dashboard
    '/admin': 'Trang chủ',
    '/admin/dashboard': 'Thống kê',

    // Bán hàng & Hóa đơn
    '/admin/orders': 'Bán hàng tại quầy',
    '/admin/invoices': 'Quản lý hóa đơn',
    '/admin/invoice-detail': 'Chi tiết hóa đơn',

    // Giảm giá
    '/admin/discounts': 'Đợt giảm giá',
    '/admin/coupons': 'Phiếu giảm giá',
    '/admin/discounts/add': 'Thêm đợt giảm giá',
    '/admin/discounts/edit': 'Chi tiết đợt giảm giá',
    '/admin/add-coupon': 'Thêm phiếu giảm giá',
    '/admin/coupons/edit': 'Chi tiết phiếu giảm giá',

    // Quản lý sản phẩm
    '/admin/products': 'Sản phẩm',
    '/admin/product-details-manager': 'Quản lý sản phẩm chi tiết',
    '/admin/product-details': 'Thêm chi tiết sản phẩm',
    '/admin/shoe-collar': 'Cổ giày',
    '/admin/shoe-soles': 'Đế giày',
    '/admin/toe': 'Mũi giày',
    '/admin/brand': 'Thương hiệu',
    '/admin/material': 'Chất liệu',
    '/admin/suppliers': 'Nhà cung cấp',
    '/admin/categories': 'Danh mục',
    '/admin/color': 'Màu sắc',
    '/admin/size': 'Kích cỡ',

    // Quản lý tài khoản
    '/admin/customers': 'Khách hàng',
    '/admin/employees': 'Nhân viên',
    '/admin/add-customer': 'Thêm khách hàng',
    '/admin/employees/add': 'Thêm nhân viên',
    '/admin/edit-customer': 'Chi tiết khách hàng',
    '/admin/employees/edit/': 'Chi tiết nhân viên',
};

// Cấu hình các route không hiển thị trong breadcrumb
export const hiddenRoutes = [
    '/admin/login',
    '/admin/change-password'
];

// Cấu hình các route có param
export const paramRoutes = {
    '/admin/products': {
        create: 'Thêm mới sản phẩm',
        edit: 'Chỉnh sửa sản phẩm',
        detail: 'Chi tiết sản phẩm'
    },
    '/admin/employees': {
        create: 'Thêm mới nhân viên',
        edit: 'Chỉnh sửa nhân viên',
        detail: 'Chi tiết nhân viên'
    },
    '/admin/customers': {
        create: 'Thêm mới khách hàng',
        edit: 'Chỉnh sửa khách hàng',
        detail: 'Chi tiết khách hàng'
    },
    '/admin/discounts': {
        create: 'Thêm mới đợt giảm giá',
        edit: 'Chỉnh sửa đợt giảm giá',
        detail: 'Chi tiết đợt giảm giá'
    }
}; 