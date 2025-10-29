import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledTextInput from '../../components/common/StyledTextInput';
import StyledButton from '../../components/common/StyledButton';
import { useAuth } from '../../context/AuthContext';
// Import the correct functions from the correct file
import {
  registerPatient,
  createEncounter,
  updateEncounter,
} from '../../services/api.js';

const RegisterScreen = ({ navigation }) => {
  const { userToken } = useAuth(); // Get the token to prove we're logged in
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); // <-- New state
  const [triageNotes, setTriageNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!fullName || !dob || !mobileNumber) {
      Alert.alert('Missing Info', 'Please fill out Full Name, DOB, and Mobile Number.');
      return;
    }

    setIsLoading(true);

    try {
      // --- 3-STEP LOGIC ---
      // Step 1: Register Patient
      const patientData = {
        full_name: fullName,
        dob: dob,
        mobile_number: mobileNumber, // <-- Add mobile number to data
        // Ask backend friend if other fields like triageNotes go here or in encounter
      };
  const patient = await registerPatient(patientData, userToken);
  // In mock DB the created patient uses `id` (not patient_id). Use whichever exists.
  const patientId = patient.patient_id || patient.id;

      // Step 2: Create Encounter (Triage)
      const encounterData = {
        patient_id: patientId,
        encounter_type: 'triage',
        notes: triageNotes, // Send triage notes here
      };
      const encounter = await createEncounter(encounterData, userToken);
      const encounterId = encounter.id;

      // Step 3: Mark as Admitted (or Outpatient based on notes?)
      // For now, default to active/admitted
      const patchData = { current_status: 'active' };
      await updateEncounter(encounterId, patchData, userToken);

      // --- END OF 3-STEP LOGIC ---

      Alert.alert(
        'Success',
        `Patient ${patient.full_name || patient.name || patientId} was registered and admitted.`
      );

      // Clear the form
      setFullName('');
      setDob('');
      setMobileNumber(''); // <-- Clear mobile number
      setTriageNotes('');

      // Go to the patient list
      navigation.navigate('Patients');
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Register New Patient</Text>

        <StyledTextInput
          label="Full Name"
          placeholder="Enter patient's full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <StyledTextInput
          label="Date of Birth (YYYY-MM-DD)"
          placeholder="YYYY-MM-DD"
          value={dob}
          onChangeText={setDob}
          keyboardType="numeric"
        />

        {/* --- New Mobile Number Field --- */}
        <StyledTextInput
          label="Mobile Number"
          placeholder="Enter patient's mobile number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
        />
        {/* ----------------------------- */}

        <StyledTextInput
          label="Initial Triage Notes"
          placeholder="Enter admitting doctor's notes..."
          value={triageNotes}
          onChangeText={setTriageNotes}
          multiline={true}
          numberOfLines={5}
        />

        <View style={{ height: 40 }} />

        <StyledButton
          title={isLoading ? 'Registering...' : 'Register Patient'}
          onPress={handleRegister}
          disabled={isLoading}
        />
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
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
});

export default RegisterScreen;

