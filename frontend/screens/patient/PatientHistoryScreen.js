import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import TimelineEvent from '../../components/patient/TimelineEvent';

// MOCK DATA for this patient's history
const MOCK_HISTORY = [
  {
    id: 'H-001',
    title: 'Admitted to Hospital',
    timestamp: '2025-10-26 10:45 AM',
    details: 'Admitted for chest pain. Awaiting cardiology consult.',
  },
  {
    id: 'H-002',
    title: 'Cardiology Consult',
    timestamp: '2025-10-26 11:15 AM',
    details: 'Initial consult complete. EKG shows no acute ST elevation.',
  },
  {
    id: 'H-003',
    title: 'Handoff Report',
    timestamp: '2025-10-26 02:30 PM',
    details: 'Handoff from Dr. Sharma to Dr. Lee complete.',
  },
  {
    id: 'H-004',
    title: 'Previous Visit: Discharged',
    timestamp: '2023-01-15 03:00 PM',
    details: 'Discharged after observation for similar symptoms. Final diagnosis: Costochondritis.',
  },
];

const PatientHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState(MOCK_HISTORY);

  const renderEvent = ({ item, index }) => (
    <TimelineEvent
      event={item}
      // This is crucial: it tells the component if it's the last one
      isLast={index === history.length - 1}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.title}>Patient Event History</Text>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  list: {
    paddingTop: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
});

export default PatientHistoryScreen;

