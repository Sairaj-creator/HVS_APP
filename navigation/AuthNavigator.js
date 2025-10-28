import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import our auth screens
import LoginScreen from '../screens/auth/LoginScreen';
// We are removing the self-register screen:
// import UserRegisterScreen from '../screens/auth/UserRegisterScreen';
// Import the NEW admin screen:
import AdminUserCreateScreen from '../screens/admin/AdminUserCreateScreen'; // <-- This screen

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      // Hide the header for the auth flow
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Add the new Admin screen to this stack */}
      <Stack.Screen
        name="AdminUserCreate" // This is the route name used in LoginScreen
        component={AdminUserCreateScreen}
        options={{ title: 'Admin User Creation' }} // Optional header title if shown
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

