import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './page/components/RootNavigator';
import Toast from 'react-native-toast-message';
export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
      <Toast/>
    </NavigationContainer>
  );
}
