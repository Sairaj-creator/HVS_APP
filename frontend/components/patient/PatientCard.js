import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import Card from '../common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

// Helper function to get status style
const getStatusStyle = (status) => {
  switch (status) {
    case 'admitted':
      return {
        style: styles.statusAdmitted,
        text: 'ADMITTED',
        icon: 'hospital-box-outline',
      };
    case 'outpatient':
      return {
        style: styles.statusOutpatient,
        text: 'OUTPATIENT',
        icon: 'stethoscope',
      };
    case 'discharged':
      return {
        style: styles.statusDischarged,
        text: 'DISCHARGED',
        icon: 'location-exit',
      };
    default:
      return { style: {}, text: 'UNKNOWN', icon: 'help-circle-outline' };
  }
};

const PatientCard = ({ patient, onPress }) => {
  // --- MOCK DATA FOR THE NEW FIELD ---
  // Replace this logic when backend provides the real status
  const mockStatus =
    patient.patient_id === 'P-12345' ? 'admitted' : 'outpatient';
  // ------------------------------------

  const { style: statusStyle, text: statusText, icon: statusIcon } =
    getStatusStyle(mockStatus); // Use mockStatus for now

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        {/* Left side: Patient Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{patient.full_name}</Text>
          <Text style={styles.details}>
            ID: {patient.patient_id} | DOB: {patient.dob}
          </Text>
        </View>

        {/* Right side: Status Badge */}
        <View style={[styles.statusContainer, statusStyle]}>
          <MaterialCommunityIcons name={statusIcon} size={14} color={COLORS.white} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base, // Added spacing between cards
  },
  infoContainer: {
    flex: 1, // Allow info to take available space
    marginRight: SIZES.base,
  },
  name: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  details: {
    ...FONTS.body4,
    color: COLORS.text,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius / 2,
    minWidth: 100, // Ensure minimum width for badge
    justifyContent: 'center',
  },
  statusText: {
    color: COLORS.white,
    ...FONTS.h4,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // --- Specific Status Styles ---
  statusAdmitted: {
    backgroundColor: COLORS.blue, // Blue for admitted
  },
  statusOutpatient: {
    backgroundColor: COLORS.orange, // Orange for outpatient
  },
  statusDischarged: {
    backgroundColor: COLORS.gray, // Gray for discharged
  },
});

export default PatientCard;

