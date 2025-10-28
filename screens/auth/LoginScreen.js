import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image, // Make sure Image is imported
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import { useAuth } from '../../context/AuthContext';

// We get the 'navigation' prop here to navigate
const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signIn(username, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* --- Image Section --- */}
      <View style={styles.logoContainer}>
        <Image
          // Use require() for local images
          source={require('../../assets/images/homelogo.png')}
          style={styles.logo}
          resizeMode="cover" // Use 'cover' to fill the circle
        />
      </View>
      {/* --------------------- */}

      {/* Optional: Add Text Titles if they are NOT part of your logo */}
      {/*
      <Text style={styles.title}>HVS</Text>
      <Text style={styles.subtitle}>Hand-Off Validation System</Text>
      */}

      <View style={styles.formContainer}>
        <StyledTextInput
          label="Hospital Email"
          placeholder="doctor@hvs.com"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <StyledTextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <View style={{ height: 20 }} />
        <StyledButton title="Login" onPress={handleLogin} />
      </View>

      {/* --- Admin Button --- */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => navigation.navigate('AdminUserCreate')} // Navigate to the admin screen
      >
        <Text style={styles.adminButtonText}>Admin User Creation</Text>
      </TouchableOpacity>
      {/* -------------------- */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  // --- Updated Logo Styles for Circular Effect ---
  logoContainer: {
    width: 150, // Set desired size
    height: 150, // Set desired size (same as width for circle)
    borderRadius: 75, // Half of width/height
    overflow: 'hidden', // Clip the image to the circle
    marginBottom: SIZES.padding * 2, // Spacing below logo
    borderWidth: 2, // Optional: Add a border
    borderColor: COLORS.lightGray, // Optional: Border color
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  // ----------------------------------------------
  // Optional Text Styles (if logo doesn't include text)
  /*
  title: {
    ...FONTS.h1,
    fontSize: 48,
    color: COLORS.primary,
  },
  subtitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: SIZES.base,
    marginBottom: SIZES.padding * 2,
  },
  */
  formContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
  },
  adminButton: {
    position: 'absolute',
    bottom: SIZES.padding * 2,
  },
  adminButtonText: {
    ...FONTS.body4,
    color: COLORS.gray,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

