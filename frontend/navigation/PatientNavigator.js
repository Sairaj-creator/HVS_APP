import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import our screens
import PatientListScreen from '../screens/main/PatientListScreen';
import PatientDetailScreen from '../screens/patient/PatientDetailScreen';
import RecordingScreen from '../screens/recording/RecordingScreen'; // This is the new one
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const PatientNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PatientList"
        component={PatientListScreen}
        options={{ headerShown: false }} // No header on the list page
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient Details' }} // This title gets replaced
      />
      {/* --- This is the new screen we added --- */}
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{
          title: 'Live Handoff',
          presentation: 'modal', // This makes it slide up from the bottom
        }}
      />
      {/* ------------------------------------- */}
    </Stack.Navigator>
  );
};

export default PatientNavigator;

