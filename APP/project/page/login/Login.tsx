import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../components/RootNavigator';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ConnectInvoice'>;


const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();


  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:8080/auth/login',
        {
          username: phone,
          password: password,
          isCustomer: false,
        },
        {
          withCredentials: true, // QUAN TRỌNG để nhận cookie (JSESSIONID)
        }
      );

      if (response.status === 200) {
        const { token, refreshToken } = response.data;

      

        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // Lấy JSESSIONID từ cookie (nếu có)
        const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
        if (setCookieHeader && setCookieHeader.length > 0) {
          const jsessionId = setCookieHeader[0].split(';')[0].split('=')[1];
          await AsyncStorage.setItem('sessionId', jsessionId);
          console.log('JSESSIONID:', jsessionId);
        }

        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
        });
        // navigation.navigate('MainTabs');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ConnectInvoice' }],
        });

        // TODO: Chuyển hướng sang trang chính
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: 'Vui lòng kiểm tra lại thông tin.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../public/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Đăng Nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logo: { width: 100, height: 100, marginBottom: 24, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#333' },
  input: { width: '100%', height: 48, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  button: { backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  registerText: { marginTop: 16, color: '#666', fontSize: 14 },
});
