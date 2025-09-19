import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các màn hình
import Login from '../login/Login';
import ConnectInvoice from '../order/ConnectInvoice';

export type RootStackParamList = {
    Login: undefined;
    ConnectInvoice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
    <Stack.Navigator id={undefined} initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ConnectInvoice" component={ConnectInvoice} />
    </Stack.Navigator>
);

export default RootNavigator;
