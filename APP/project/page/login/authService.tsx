// /services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from './decodeToken'; // Dùng lại decodeToken.js

const BASE_URL = 'http://10.0.2.2:8080';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password,
      isCustomer: true,
    });

    if (response.status === 200) {
      const { token, refreshToken } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      const decodedToken = decodeToken(token);

      if (decodedToken && (decodedToken.permissions.includes("ADMIN")||decodedToken.permissions.includes("STAFF"))) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    return false;
  }
};

export const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log("Không có refresh token, cần đăng nhập lại.");
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/get-token`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (response.status === 200) {
      const { token, refreshToken: newRefreshToken } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      console.log("Token đã được làm mới.");
      return true;
    }
  } catch (error) {
    console.log("Lỗi khi làm mới token:", error);
    return false;
  }

  return false;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('refreshToken');
};
