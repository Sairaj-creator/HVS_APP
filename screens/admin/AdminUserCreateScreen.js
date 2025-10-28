import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import { Picker } from '@react-native-picker/picker';

// Import the correct admin function from api.js
import { apiAdminCreateUser } from '../../services/api.js';

// !! IMPORTANT !!
// How does the Admin authenticate? They need a token.
// For now, we assume the Admin logs in separately and has a token.
// We might need to adjust this based on your friend's exact plan.
const TEMP_ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE'; // Placeholder

const AdminUserCreateScreen = ({ navigation }) => {
  const [username, setUsername] = useState(''); // Email
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Added Full Name
  const [role, setRole] = useState('doctor'); // Default role
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!username || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      // Data structure based on your friend's docs
      const userData = {
        username: username,
        password: password,
        role: role,
        full_name: fullName, // Make sure backend expects this
      };

      // Call the ADMIN endpoint, passing the Admin's token
      const result = await apiAdminCreateUser(userData, TEMP_ADMIN_TOKEN);

      Alert.alert(
        'Success',
        `User ${result.username} (${result.role}) created!`
      );
      // Clear the form
      setUsername('');
      setPassword('');
      setFullName('');
      setRole('doctor');
      // Optionally navigate somewhere else or stay here
    } catch (error) {
      Alert.alert('Creation Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Admin: Create User</Text>
        <Text style={styles.subtitle}>
          Register a new Doctor or Nurse account
        </Text>

        <View style={styles.formContainer}>
          <StyledTextInput
            label="User's Full Name"
            placeholder="Enter full name"
            value={fullName}
            onChangeText={setFullName}
          />
          <StyledTextInput
            label="User's Hospital Email"
            placeholder="doctor.name@hvs.com"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <StyledTextInput
            label="Temporary Password"
            placeholder="Enter a strong temporary password"
            value={password}
            onChangeText={setPassword}
            // secureTextEntry={true} // Maybe show password for admin?
          />

          {/* Role Picker */}
          <Text style={styles.label}>Select Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Doctor" value="doctor" />
              <Picker.Item label="Nurse" value="nurse" />
            </Picker>
          </View>

          <View style={{ height: 20 }} />
          <StyledButton
            title={isLoading ? 'Creating...' : 'Create User Account'}
            onPress={handleCreateUser}
            disabled={isLoading}
          />
        </View>

        {/* Optional: Add a back button if needed */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
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

export default AdminUserCreateScreen;
