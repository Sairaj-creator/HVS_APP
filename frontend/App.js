import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text } from 'react-native'; // Added View and Text for loading/debug state

// Import theme colors (could import from theme now, but colors is fine too)
import { COLORS } from './constants/colors';
import { AuthProvider, useAuth } from './context/AuthContext'; // Using the simplified context

// Import Navigators and Loader
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import Loader from './components/common/Loader';

// Root component wraps everything in the AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
};

// This component uses the AuthContext to decide which navigator to show
const AppRoot = () => {
  const { userToken, isLoading } = useAuth();

  // If AuthContext is still initializing
  // (e.g., checking for a saved token, which isLoading=true initially handles)
  if (isLoading) {
     // Return a simple blank view during this initial check
     // Or you could return a dedicated splash/loading screen component
    return <View style={{ flex: 1, backgroundColor: COLORS.white }} />;
  }


  return (
    <SafeAreaProvider>
      {/* DEV DEBUG overlay removed: hide mock token from UI. If you need this overlay again,
          re-enable by uncommenting the block below or by adding a feature flag. */}
      {/* Set status bar style using the defined statusBar color */}
      <StatusBar backgroundColor={COLORS.statusBar} barStyle="light-content" />

      {/* Navigation container holds the chosen navigator */}
      <NavigationContainer>
        {/* If userToken exists, show main app, otherwise show login/auth flow */}
        {userToken ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      {/* Loader for login attempts (currently commented out for debugging) */}
      {/* We get isLoading from useAuth(), but it might conflict with the initial loading state */}
      {/* Let's keep this commented until the initial loading is confirmed working */}
      {/* <Loader visible={isLoading} /> */}

    </SafeAreaProvider>
  );
};

export default App;

