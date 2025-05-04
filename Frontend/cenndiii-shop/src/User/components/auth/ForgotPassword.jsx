import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordForm() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            axios.put("http://localhost:8080/auth/forgot-password", null, {
                params: {
                    username: username,
                    isCustomer: true
                }
            }).then((res) => {
                if (res.data.code === 200) {
                    alert("Mật khẩu mới đã được gửi đến email của bạn!");
                    navigate("/login");
                } else {
                    alert(res.data.message);
                }
            });
        } catch (error) {
            alert("Có lỗi xảy ra khi lấy lại mật khẩu!");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>
                <form onSubmit={handleSubmit}>
                    {/* Username Input */}
                    <div className="mb-4 relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Số điện thoại hoặc email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all"
                    >
                        Lấy lại mật khẩu
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