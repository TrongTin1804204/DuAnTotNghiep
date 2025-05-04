import { Globe, Sun, Bell, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, Avatar, IconButton, Breadcrumbs, Typography, Divider } from "@mui/material";
import { getPermissions, getUserName, logout } from "../../../security/DecodeJWT";
import { adminRouteNames, hiddenRoutes, paramRoutes } from "../../configs/routeConfig";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [user, setUser] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUser(getPermissions());
    setUserName(getUserName());
  }, []);

  const handleLogout = () => {
    handleClose();
    logout(user);
    navigate("/admin/login");
  };

  const handleChangePassword = () => {
    handleClose();
    navigate("/admin/change-password");
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Tạo breadcrumbs từ pathname
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);

    return pathnames.map((value, index) => {
      // Tạo đường dẫn tích lũy
      const to = '/' + pathnames.slice(0, index + 1).join('/');

      // Kiểm tra nếu là route cuối cùng và có thể chứa param
      if (index === pathnames.length - 1) {
        // Kiểm tra xem có phải là route có param không
        const baseRoute = '/' + pathnames.slice(0, index).join('/');
        if (paramRoutes[baseRoute]) {
          // Xác định loại action từ URL
          if (to.includes('/create')) {
            return paramRoutes[baseRoute].create;
          } else if (to.includes('/edit')) {
            return paramRoutes[baseRoute].edit;
          } else if (to.includes('/detail')) {
            return paramRoutes[baseRoute].detail;
          }
        }
      }

      // Nếu không phải param route, lấy tên từ config
      const name = adminRouteNames[to] || value;

      // Kiểm tra nếu là route cuối
      const isLast = index === pathnames.length - 1;

      // Nếu route nằm trong danh sách ẩn, không hiển thị
      if (hiddenRoutes.includes(to)) {
        return null;
      }

      return isLast ? (
        <Typography key={to} color="text.primary" className="text-sm font-medium">
          {name}
        </Typography>
      ) : (
        <Typography
          key={to}
          className="text-sm text-gray-500 hover:text-black cursor-pointer"
          onClick={() => navigate(to)}
        >
          {name}
        </Typography>
      );
    }).filter(Boolean); // Lọc bỏ các phần tử null
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <header className="min-h-[4rem] bg-white flex flex-col shadow-md">
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <Breadcrumbs
          separator={<ChevronRight size={16} />}
          aria-label="breadcrumb"
        >
          {breadcrumbItems}
        </Breadcrumbs>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <IconButton className="hover:bg-gray-100">
              <Globe size={20} />
            </IconButton>
            <IconButton className="hover:bg-gray-100">
              <Sun size={20} />
            </IconButton>
            <IconButton className="hover:bg-gray-100">
              <Bell size={20} />
            </IconButton>
          </div>

          <div
            className="flex items-center space-x-3 py-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer transition-all"
            onClick={handleClick}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#000',
                fontSize: '1rem'
              }}
            >
              {userName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">{user}</p>
            </div>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
              }
            }}
          >
            <MenuItem onClick={handleChangePassword} className="text-sm">
              Đổi mật khẩu
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} className="text-sm text-red-600">
              Đăng xuất
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
