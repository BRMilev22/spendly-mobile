import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import LoginScreen from './LoginScreen';
import ReceiptScreen from './ReceiptScreen';
import HomeScreen from './HomeScreen';
import HistoryScreen from './HistoryScreen';
import RemindersScreen from './RemindersScreen';
import RegisterScreen from './RegisterScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="App" component={AppTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#222222' },
        tabBarActiveTintColor: '#00D048',
        tabBarInactiveTintColor: '#D9D9D9',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptScreen}
        options={{
          tabBarLabel: 'Receipts',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};


export default App;
