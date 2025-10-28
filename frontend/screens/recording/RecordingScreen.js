import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StyledButton from '../../components/common/StyledButton';

// Mock SBAR Checklist
const MOCK_SBAR = [
  { id: 's', label: 'Situation', complete: true },
  { id: 'b', label: 'Background', complete: true },
  { id: 'a', label: 'Assessment', complete: false },
  { id: 'r', label: 'Recommendation', complete: false },
];

// Mock Live Transcript
const MOCK_TRANSCRIPT =
  "Patient is Sairaj Patil, P-12345. Admitted for chest pain. Vitals are stable, pain is 3/10. We've given morphine and are awaiting troponin results...";

const RecordingScreen = ({ navigation }) => {
  const [liveTranscript, setLiveTranscript] = useState(MOCK_TRANSCRIPT);
  const [checklist, setChecklist] = useState(MOCK_SBAR);

  const handleStopRecording = () => {
    // This will stop the audio stream and save the handoff
    console.log('Stopping recording...');
    // After saving, we go back to the patient notes
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Live Transcript Area */}
      <ScrollView style={styles.transcriptScroll}>
        <Text style={styles.header}>Live Transcript</Text>
        <Text style={styles.transcriptText}>{liveTranscript}</Text>
      </ScrollView>

      {/* 2. SBAR Checklist Area */}
      <View style={styles.checklistContainer}>
        <Text style={styles.header}>SBAR Validation</Text>
        {checklist.map((item) => (
          <View style={styles.checklistItem} key={item.id}>
            <MaterialCommunityIcons
              name={
                item.complete
                  ? 'checkbox-marked-circle'
                  : 'checkbox-blank-circle-outline'
              }
              size={24}
              color={item.complete ? COLORS.darkGreen : COLORS.gray}
            />
            <Text
              style={[
                styles.checklistLabel,
                item.complete && styles.checklistLabelComplete,
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 3. Stop Button Area */}
      <View style={styles.buttonContainer}>
        <StyledButton title="Stop Handoff & Save" onPress={handleStopRecording} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    ...FONTS.h2,
    color: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  // Transcript Styles
  transcriptScroll: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  transcriptText: {
    ...FONTS.body3,
    color: COLORS.text,
    lineHeight: 24,
    paddingBottom: SIZES.padding,
  },
  // Checklist Styles
  checklistContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.lightGray,
    ...SHADOWS.light,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.base / 2,
  },
  checklistLabel: {
    ...FONTS.h3,
    color: COLORS.gray,
    marginLeft: SIZES.base,
  },
  checklistLabelComplete: {
    color: COLORS.darkGreen,
    textDecorationLine: 'line-through',
  },
  // Button Styles
  buttonContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});

export default RecordingScreen;
