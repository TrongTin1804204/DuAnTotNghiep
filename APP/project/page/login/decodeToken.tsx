import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  userName: string;
  permissions: string[];
}

export const decodeToken = (token: string | null): DecodedToken | null => {
  try {
    if (typeof token === 'string' && token.trim() !== '') {
      return jwtDecode<DecodedToken>(token);
    } else {
      console.error('Token không hợp lệ');
      return null;
    }
  } catch (err) {
    console.error("Lỗi giải mã token:", err);
    return null;
  }
};

export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return decodeToken(token);
  } catch (err) {
    console.error('Lỗi khi lấy token từ AsyncStorage:', err);
    return null;
  }
};

export const getUserId = async (): Promise<number | null> => {
  try {
    const decoded = await getDecodedToken();
    return decoded?.id || null;
  } catch (err) {
    console.error('Lỗi khi lấy userId:', err);
    return null;
  }
};

export const getPermissions = async (): Promise<string[]> => {
  try {
    const decoded = await getDecodedToken();
    return decoded?.permissions || [];
  } catch (err) {
    console.error('Lỗi khi lấy permissions:', err);
    return [];
  }
};

export const hasPermission = async (permission: string): Promise<boolean> => {
  try {
    const permissions = await getPermissions();
    return permissions.includes(permission);
  } catch (err) {
    console.error('Lỗi khi kiểm tra quyền hạn:', err);
    return false;
  }
};

export const getUserName = async (): Promise<string> => {
  try {
    const decoded = await getDecodedToken();
    return decoded?.userName || '';
  } catch (err) {
    console.error('Lỗi khi lấy tên người dùng:', err);
    return '';
  }
};
