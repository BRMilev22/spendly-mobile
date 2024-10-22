import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import LoginScreen from './LoginScreen';
import ReceiptScreen from './ReceiptScreen';

const Stack = createNativeStackNavigator();


const App = () => {
  /*
  useEffect(() => {
    // Clear AsyncStorage on app start
    const clearStorage = async () => {
      try {
        await AsyncStorage.clear(); // Clear all AsyncStorage data
        console.log('AsyncStorage cleared'); // Log for confirmation
      } catch (error) {
        console.error('Failed to clear AsyncStorage:', error);
      }
    };

    clearStorage();
  }, []); // Run this effect only once on mount
  */

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
