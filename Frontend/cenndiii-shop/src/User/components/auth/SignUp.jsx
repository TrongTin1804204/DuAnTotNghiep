import React, { useState } from "react";
import { Mail, Lock, User, Phone } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        hoTen: "",
        soDienThoai: "",
        email: "",
        matKhau: "",
        confirmPassword: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.matKhau !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            axios.post("http://localhost:8080/auth/sign-up", {
                hoTen: formData.hoTen,
                soDienThoai: formData.soDienThoai,
                email: formData.email,
                matKhau: formData.matKhau
            }).then((res) => {
                if (res.data.code === 200) {
                    alert("Đăng ký thành công!");
                    navigate("/login");
                } else {
                    alert(res.data.message);
                }
            });
        } catch (error) {
            alert("Có lỗi xảy ra khi đăng ký!");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>
                <form onSubmit={handleSubmit}>
                    {/* Họ tên Input */}
                    <div className="mb-4 relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="hoTen"
                            placeholder="Họ và tên"
                            value={formData.hoTen}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Số điện thoại Input */}
                    <div className="mb-4 relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="number"
                            name="soDienThoai"
                            placeholder="Số điện thoại"
                            value={formData.soDienThoai}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-4 relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="matKhau"
                            placeholder="Mật khẩu"
                            value={formData.matKhau}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Xác nhận mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all"
                    >
                        Đăng ký
                    </button>

                    {/* Back to Login */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:underline"
                        >
                            Quay lại đăng nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 