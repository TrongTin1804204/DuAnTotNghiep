import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getUserName, getPermissions } from '../login/decodeToken';
import { logout } from '../login/authService';
import Toast from 'react-native-toast-message';

const Header = ({ navigation }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false); // Trạng thái hiển thị dropdown
  const [userName, setUserName] = useState(''); // Tên người dùng từ decodeToken
  const [permissions, setPermissions] = useState([]); // Danh sách quyền từ decodeToken

  useEffect(() => {
    // Lấy tên người dùng và quyền khi component được render
    const fetchData = async () => {
      try {
        const name = await getUserName(); // Lấy tên người dùng
        const perms = await getPermissions(); // Lấy danh sách quyền
        setUserName(name || 'Guest'); // Cập nhật tên người dùng
        setPermissions(perms || []); // Cập nhật danh sách quyền
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // Xoá token, session, v.v.
      Toast.show({
        type: 'success',
        text1: 'Đăng xuất thành công!',
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };


  return (
    <View style={styles.container}>
      {/* Logo bên trái */}
      <Image source={require('../../public/logo.png')} style={styles.logo} />

      {/* Bên phải: giỏ hàng + icon đăng nhập */}
      <View style={styles.rightSection}>
        {/* Icon người */}
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Ionicons name="person-outline" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>

        {/* Dropdown */}
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>{userName}</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.dropdownText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: { marginTop: 15, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
  logo: { width: 60, height: 60, resizeMode: 'contain' },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  dropdown: { position: 'absolute', top: 40, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: 'gray', borderRadius: 8, padding: 10, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  dropdownText: { fontSize: 16, paddingVertical: 5, color: 'black' },
});