import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Correctly import theme and context
import { COLORS } from '../constants/colors'; // Assuming colors.js is correct
import { useAuth } from '../context/AuthContext'; // Import useAuth to get the role

// Import screens/navigators
import DashboardScreen from '../screens/main/DashboardScreen';
import PatientNavigator from './PatientNavigator';
import RegisterScreen from '../screens/main/RegisterScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import AdminScreen from '../screens/admin/AdminScreen'; // Import Admin screen

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    // Get the user's role from the authentication context
    const { role } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Function to set the icon for each tab
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    // Assign icons based on route name
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Patients') iconName = focused ? 'account-group' : 'account-group-outline';
                    else if (route.name === 'Register') iconName = focused ? 'plus-box' : 'plus-box-outline';
                    else if (route.name === 'Settings') iconName = focused ? 'cog' : 'cog-outline';
                    else if (route.name === 'Admin') iconName = focused ? 'shield-account' : 'shield-account-outline';
                    else iconName = 'help-circle'; // Default icon
                    // Return the icon component
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                // Styling for the tab bar
                tabBarActiveTintColor: COLORS.primary, // Color for active tab icon/label
                tabBarInactiveTintColor: COLORS.gray, // Color for inactive tab icon/label
                headerShown: false, // Hide default headers for screens in the tab navigator
                tabBarStyle: { // Optional: Add styles to the tab bar itself
                    // backgroundColor: COLORS.white,
                    // borderTopColor: COLORS.lightGray,
                },
                tabBarLabelStyle:{ // Optional: Style the label text
                    // paddingBottom: 2,
                },
            })}
        >
            {/* Standard tabs visible to all logged-in users */}
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Patients" component={PatientNavigator} />
            <Tab.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: 'Register Patient' }} // Sets the label under the icon
            />
            <Tab.Screen name="Settings" component={SettingsScreen} />

            {/* Dynamic Admin Tab - Conditionally render based on the user's role */}
            {/* This tab will only be included in the navigator if the logged-in user's role is 'admin' */}
            {role === 'admin' && (
                <Tab.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{ title: 'Admin Panel' }} // Sets the label under the icon
                />
            )}
        </Tab.Navigator>
    );
};

export default AppNavigator;

