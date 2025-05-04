import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getPhoneNumber } from "../../../security/DecodeJWT";
export default function ChangePasswordForm() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        try {


            const response = await axios.put("http://localhost:8080/auth/change-password", null, {
                params: {
                    username: getPhoneNumber(),
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                    isCustomer: true
                }
            });

            if (response.data.code === 200) {
                toast.success("Đổi mật khẩu thành công!");
                navigate("/");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Đổi mật khẩu thất bại!");
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-6">Đổi mật khẩu</h2>
                <form onSubmit={handleSubmit}>
                    {/* Old Password Input */}
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type={showPassword.oldPassword ? "text" : "password"}
                            name="oldPassword"
                            placeholder="Mật khẩu cũ"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400"
                            onClick={() => togglePasswordVisibility("oldPassword")}
                        >
                            {showPassword.oldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* New Password Input */}
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type={showPassword.newPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="Mật khẩu mới"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400"
                            onClick={() => togglePasswordVisibility("newPassword")}
                        >
                            {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type={showPassword.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Xác nhận mật khẩu mới"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400"
                            onClick={() => togglePasswordVisibility("confirmPassword")}
                        >
                            {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all"
                    >
                        Đổi mật khẩu
                    </button>

                    {/* Back Button */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="text-blue-600 hover:underline"
                        >
                            Quay lại
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 