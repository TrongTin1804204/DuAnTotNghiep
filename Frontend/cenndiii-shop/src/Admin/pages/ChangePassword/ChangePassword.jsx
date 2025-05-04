import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../../security/Axios";
import Notification from "../../../components/Notification";
import { hasPermission, getPhoneNumber, } from "../../../security/DecodeJWT";
export default function ChangePassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        username: getPhoneNumber(),
        isCustomer: hasPermission("CUSTOMER"),
    });
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.oldPassword) {
            newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (formData.confirmPassword !== formData.newPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await api.put("/auth/change-password",
                {},
                {
                    params: {
                        username: formData.username,
                        oldPassword: formData.oldPassword,
                        newPassword: formData.newPassword,
                        isCustomer: formData.isCustomer
                    }
                }
            );
            if (response.data.code === 200) {
                Notification("Đổi mật khẩu thành công", "success");
                navigate("/admin/dashboard");
            } else {
                Notification(response.data.message, "error");
            }
        } catch (error) {
            if (error.response?.status === 400) {
                setErrors({ oldPassword: "Mật khẩu hiện tại không đúng" });
            } else {
                Notification("Đổi mật khẩu thất bại", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Đổi mật khẩu</h2>

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
                    {/* Mật khẩu hiện tại */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.old ? "text" : "password"}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 ${errors.oldPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("old")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {/* {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />} */}
                            </button>
                        </div>
                        {errors.oldPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.oldPassword}</p>
                        )}
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 ${errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("new")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {/* {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />} */}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirm")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {/* {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />} */}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
