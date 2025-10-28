import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker'; // Our new component

// --- This is the new API function we're about to add ---
    import { apiRegisterUser } from '../../services/api.js';
    


const UserRegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState(''); // This will be their email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('doctor'); // Default role
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // This is the data your friend's API needs
      const userData = {
        username: username,
        password: password,
        role: role,
      };

      // Call the API
      const result = await apiRegisterUser(userData);

      Alert.alert(
        'Success',
        `User ${result.username} created! Please log in.`
      );
      navigation.goBack(); // Go back to the Login screen
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register as a new clinical user</Text>

      <View style={styles.formContainer}>
        <StyledTextInput
          label="Hospital Email"
          placeholder="your.email@hvs.com"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <StyledTextInput
          label="Password"
          placeholder="Enter a strong password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <StyledTextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />

        {/* --- This is the new Role Picker --- */}
        <Text style={styles.label}>Select Your Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Doctor" value="doctor" />
            <Picker.Item label="Nurse" value="nurse" />
            {/* Add more roles here if needed */}
          </Picker>
        </View>

        <View style={{ height: 20 }} />
        <StyledButton
          title={isLoading ? 'Registering...' : 'Register'}
          onPress={handleRegister}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.base,
    marginTop: SIZES.padding,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
  },
  picker: {
    width: '100%',
    color: COLORS.text,
  },
  backButton: {
    ...FONTS.h4,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});

export default UserRegisterScreen;

