import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getPatientSummary } from '../../services/api.js'; // Import API function

// InfoRow component for displaying labeled data
const InfoRow = ({ icon, label, value, valueStyle = {} }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, valueStyle]}>{value || 'N/A'}</Text>
  </View>
);

// Helper function for admission status styles
const getAdmissionStatusStyle = (status) => {
  switch (status?.toLowerCase()) { // Added safety check for status
    case 'admitted':
      return { style: styles.statusAdmitted, text: 'ADMITTED', icon: 'hospital-box-outline' };
    case 'outpatient':
      return { style: styles.statusOutpatient, text: 'OUTPATIENT', icon: 'stethoscope' };
    case 'discharged':
      return { style: styles.statusDischarged, text: 'DISCHARGED', icon: 'location-exit' };
    default:
      return { style: {}, text: 'UNKNOWN', icon: 'help-circle-outline' };
  }
};

const PatientSummaryScreen = ({ navigation }) => {
  const { userToken } = useAuth();
  const route = useRoute();
  const patientId = route.params?.patientId;

  const [summaryData, setSummaryData] = useState(null); // State to hold API data
  const [isLoading, setIsLoading] = useState(false);

  // Load summary data when screen focuses or patientId/token changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userToken && patientId) {
        loadSummary();
      }
    });
    // Also load initially if token/patientId available
    if (userToken && patientId) {
      loadSummary();
    }
    return unsubscribe;
  }, [navigation, userToken, patientId]);

  const loadSummary = async () => {
    setIsLoading(true);
    console.log(`Loading summary for patient: ${patientId}`);
    try {
      // --- Replace MOCK_SUMMARY with actual API call ---
      // const data = await getPatientSummary(patientId, userToken);
      // setSummaryData(data);

      // Using mock data until API is ready
      setSummaryData({
        patientId: patientId, // Use the actual ID passed
        fullName: 'Sairaj Patil (Mock)', // Mock Data
        dob: '1990-05-15',
        mobileNumber: '+91 98765 43210',
        vitals: { bp: '125/85', hr: '70 bpm', temp: '37.0°C', pain: '2/10' },
        triageNote: 'Mock triage note for patient ' + patientId,
        codeStatus: 'Full Code',
        admissionStatus: patientId === 'P-12345' ? 'admitted' : 'outpatient', // Example dynamic mock
        estimatedLengthOfStay: patientId === 'P-12345' ? '2 days' : null,
        admissionDate: patientId === 'P-12345' ? '2025-10-29 09:00 AM' : null,
      });
      // --------------------------------------------------

    } catch (error) {
      Alert.alert('Error', `Could not load patient summary: ${error.message}`);
      setSummaryData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading or empty state if data isn't available
  if (isLoading) {
    return <View style={styles.container}><Text>Loading Summary...</Text></View>;
  }
  if (!summaryData) {
    return <View style={styles.container}><Text>No summary data available.</Text></View>;
  }

  // Get status styles based on fetched/mock data
  const {
    style: admissionStyle,
    text: admissionText,
    icon: admissionIcon,
  } = getAdmissionStatusStyle(summaryData.admissionStatus);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Admission Status Card */}
      <Card style={[styles.card, admissionStyle]}>
        <View style={styles.admissionHeader}>
          <MaterialCommunityIcons name={admissionIcon} size={24} color={COLORS.white} />
          <Text style={styles.admissionTitle}>Admission Status</Text>
        </View>
        <Text style={styles.admissionStatusText}>{admissionText}</Text>
        {summaryData.admissionStatus === 'admitted' && (
          <>
            <InfoRow
              icon="calendar-clock"
              label="Admitted On"
              value={summaryData.admissionDate}
              valueStyle={styles.admissionValue}
            />
            <InfoRow
              icon="timer-sand"
              label="Est. Stay"
              value={summaryData.estimatedLengthOfStay}
              valueStyle={styles.admissionValue}
            />
          </>
        )}
      </Card>

      {/* Demographics Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Patient Information</Text>
        <InfoRow
          icon="account-outline"
          label="Name"
          value={summaryData.fullName}
        />
        <InfoRow
          icon="calendar-account"
          label="DOB"
          value={summaryData.dob}
        />
        <InfoRow
          icon="cellphone"
          label="Mobile"
          value={summaryData.mobileNumber}
        />
        <InfoRow
          icon="identifier"
          label="Patient ID"
          value={summaryData.patientId}
        />
      </Card>

      {/* Vitals Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Current Vitals</Text>
        <InfoRow
          icon="heart-pulse"
          label="Heart Rate"
          value={summaryData.vitals?.hr} // Use optional chaining
        />
        <InfoRow
          icon="blood-pressure"
          label="Blood Pressure"
          value={summaryData.vitals?.bp}
        />
        <InfoRow
          icon="thermometer"
          label="Temp"
          value={summaryData.vitals?.temp}
        />
        <InfoRow
          icon="emoticon-sad-outline"
          label="Pain"
          value={summaryData.vitals?.pain}
        />
      </Card>

      {/* Triage Note Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Admitting Triage Note</Text>
        <Text style={styles.triageNote}>{summaryData.triageNote || 'N/A'}</Text>
      </Card>

      {/* Code Status Card */}
      <Card style={[styles.card, styles.codeStatusCard]}>
        <Text style={[styles.cardTitle, styles.codeStatusTitle]}>
          Code Status
        </Text>
        <Text style={styles.codeStatusText}>{summaryData.codeStatus || 'N/A'}</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scroll: {
    padding: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.padding,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: SIZES.padding / 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: SIZES.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.base / 2,
    paddingVertical: 4,
  },
  infoLabel: {
    ...FONTS.h4,
    color: COLORS.text,
    marginLeft: SIZES.base,
    minWidth: 100, // Align values better
  },
  infoValue: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: SIZES.base,
    flex: 1, // Allow value to wrap
    textAlign: 'right',
  },
  triageNote: {
    ...FONTS.body4,
    color: COLORS.text,
    lineHeight: 22,
  },
  codeStatusCard: {
    backgroundColor: COLORS.lightRed,
    ...SHADOWS.medium,
  },
  codeStatusTitle: {
    color: COLORS.red,
    borderBottomColor: COLORS.red,
  },
  codeStatusText: {
    ...FONTS.h1,
    color: COLORS.red,
    textAlign: 'center',
    paddingVertical: SIZES.base,
  },
  admissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  admissionTitle: {
    ...FONTS.h3,
    color: COLORS.white,
    marginLeft: SIZES.base,
  },
  admissionStatusText: {
    ...FONTS.h1,
    fontSize: 28,
    color: COLORS.white,
    textAlign: 'center',
    marginVertical: SIZES.base,
  },
  admissionValue: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statusAdmitted: {
    backgroundColor: COLORS.blue,
  },
  statusOutpatient: {
    backgroundColor: COLORS.orange,
  },
  statusDischarged: {
    backgroundColor: COLORS.gray,
  },
});

export default PatientSummaryScreen;

