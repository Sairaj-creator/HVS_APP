import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import MedAlarm from '../../components/patient/MedAlarm';
import StyledButton from '../../components/common/StyledButton';

// MOCK DATA for this specific patient
const MOCK_MEDS = [
  {
    id: 'M-001',
    name: 'Morphine',
    dosage: '10mg IV',
    time: '08:00',
    status: 'complete',
  },
  {
    id: 'M-002',
    name: 'Lisinopril',
    dosage: '20mg PO',
    time: '09:00',
    status: 'complete',
  },
  {
    id: 'M-003',
    name: 'Atorvastatin',
    dosage: '40mg PO',
    time: '12:00',
    status: 'upcoming',
  },
  {
    id: 'M-004',
    name: 'Metformin',
    dosage: '500mg PO',
    time: '18:00',
    status: 'upcoming',
  },
  {
    id: 'M-005',
    name: 'Warfarin',
    dosage: '5mg PO',
    time: '21:00',
    status: 'past_due', // This one will be highlighted
  },
];

const PatientMedsScreen = ({ navigation }) => {
  const [meds, setMeds] = useState(MOCK_MEDS);

  const handleAddMed = () => {
    // This will open a new form/modal later
    console.log('Add new medication for this patient');
  };

  // Split the data for the SectionList
  const upcoming = meds.filter(
    (med) => med.status === 'upcoming' || med.status === 'past_due'
  );
  const completed = meds.filter((med) => med.status === 'complete');

  const DATA = [
    {
      title: 'Upcoming Medications',
      data: upcoming,
    },
    {
      title: 'Completed Today',
      data: completed,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={DATA}
        keyExtractor={(item) => item.id}
        // --- THIS IS THE CORRECTED LINE ---
        renderItem={({ item }) => <MedAlarm med={item} />}
        // ------------------------------------
        renderSectionHeader={({ section: { title, data } }) =>
          data.length > 0 ? (
            <Text style={styles.header}>{title}</Text>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
      <View style={styles.buttonContainer}>
        <StyledButton
          title="Add New Medication"
          onPress={handleAddMed}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  list: {
    paddingBottom: 100, // Make space for the button
  },
  header: {
    ...FONTS.h2,
    color: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});

export default PatientMedsScreen;

