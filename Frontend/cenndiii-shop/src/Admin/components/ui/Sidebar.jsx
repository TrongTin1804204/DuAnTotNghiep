import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, User, Percent, Box, FileText, ChevronRight } from "lucide-react";
import { hasPermission } from "../../../security/DecodeJWT";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleMenuClick = () => {
    setOpenMenu(null);
  };

  return (
    <aside className="h-full bg-white shadow-lg flex flex-col">
      {/* Logo section - fixed at top */}
      <div className="p-4 border-b">
        <img src="/logo.png" alt="" className="h-20 mx-auto" />
      </div>

      {/* Navigation section - scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 text-xs scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-200"}`
          }
          onClick={handleMenuClick}
        >
          <Home size={20} />
          <span>Thống kê</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-200"}`
          }
          onClick={handleMenuClick}
        >
          <ShoppingCart size={20} />
          <span>Bán hàng tại quầy</span>
        </NavLink>

        <NavLink
          to="/admin/invoices"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-200"}`
          }
          onClick={handleMenuClick}
        >
          <FileText size={20} />
          <span>Hóa đơn</span>
        </NavLink>

        {/* Giảm giá */}
        <div>
          <button
            onClick={() => toggleMenu("sales")}
            className="flex items-center justify-between p-2 w-full text-left rounded transition-all hover:bg-gray-200"
          >
            <div className="flex items-center space-x-2">
              <Percent size={20} />
              <span>Giảm giá</span>
            </div>
            <ChevronRight
              size={18}
              className={`transition-transform duration-300 ${openMenu === "sales" ? "rotate-90" : ""}`}
            />
          </button>
          <div
            className={`pl-6 transition-all duration-300 overflow-hidden ${openMenu === "sales" ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <NavLink
              to="/admin/discounts"
              className={({ isActive }) =>
                `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
              }
            >
              Đợt giảm giá
            </NavLink>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) =>
                `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
              }
            >
              Phiếu giảm giá
            </NavLink>
          </div>
        </div>

        {/* Quản lý sản phẩm */}
        {hasPermission("ADMIN") && (
          <div>
            <button
              onClick={() => toggleMenu("products")}
              className="flex items-center justify-between p-2 w-full text-left rounded transition-all hover:bg-gray-200"
            >
              <div className="flex items-center space-x-2">
                <Box size={20} />
                <span>Quản lý sản phẩm</span>
              </div>
              <ChevronRight
                size={18}
                className={`transition-transform duration-300 ${openMenu === "products" ? "rotate-90" : ""}`}
              />
            </button>
            <div
              className={`pl-6 transition-all duration-300 overflow-hidden ${openMenu === "products" ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/admin/shoe-collar"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Cổ giày
              </NavLink>
              <NavLink
                to="/admin/shoe-soles"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Đế giày
              </NavLink>
              <NavLink
                to="/admin/toe"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Mũi giày
              </NavLink>
              <NavLink
                to="/admin/brand"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Thương hiệu
              </NavLink>
              <NavLink
                to="/admin/material"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Chất liệu
              </NavLink>
              <NavLink
                to="/admin/suppliers"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Nhà cung cấp
              </NavLink>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Danh mục
              </NavLink>
              <NavLink
                to="/admin/color"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Màu sắc
              </NavLink>
              <NavLink
                to="/admin/size"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Kích cỡ
              </NavLink>
            </div>
          </div>
        )}

        {/* Quản lý tài khoản */}
        <div>
          <button
            onClick={() => toggleMenu("account")}
            className="flex items-center justify-between p-2 w-full text-left rounded transition-all hover:bg-gray-200"
          >
            <div className="flex items-center space-x-2">
              <User size={20} />
              <span>Quản lý tài khoản</span>
            </div>
            <ChevronRight
              size={18}
              className={`transition-transform duration-300 ${openMenu === "account" ? "rotate-90" : ""}`}
            />
          </button>
          <div
            className={`pl-6 transition-all duration-300 overflow-hidden ${openMenu === "account" ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
              }
            >
              Khách hàng
            </NavLink>
            {hasPermission("ADMIN") && (
              <NavLink
                to="/admin/employees"
                className={({ isActive }) =>
                  `block p-2 rounded text-xs transition-all ${isActive ? "bg-gray-300" : "hover:bg-gray-100"}`
                }
              >
                Nhân viên
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
