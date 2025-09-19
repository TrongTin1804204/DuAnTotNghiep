
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshToken } from './authService'; // Cần tạo lại hàm refreshToken trong React Native

const BASE_URL = "http://10.0.2.2:8080"; // hoặc API endpoint của bạn

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor để luôn gửi token trong header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ Không tìm thấy token, API có thể bị lỗi!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = await AsyncStorage.getItem('token'); // Lấy token mới
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
