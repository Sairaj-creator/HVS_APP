import React, { useState, useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native'; // Removed unused Text import
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useRoute } from '@react-navigation/native';

// Import sub-screens
import PatientSummaryScreen from './PatientSummaryScreen';
import PatientNotesScreen from './PatientNotesScreen';
import PatientTasksScreen from './PatientTasksScreen';
import PatientMedsScreen from './PatientMedsScreen';
import PatientHistoryScreen from './PatientHistoryScreen';

// Correctly import theme components
// Make sure constants/theme.js correctly exports FONTS
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const renderScene = SceneMap({
    summary: PatientSummaryScreen,
    notes: PatientNotesScreen,
    tasks: PatientTasksScreen,
    meds: PatientMedsScreen,
    history: PatientHistoryScreen,
});

const PatientDetailScreen = ({ navigation }) => {
    const layout = useWindowDimensions();
    const route = useRoute();
    // Use optional chaining for safety, although patientId should always be passed
    const patientId = route.params?.patientId;

    useEffect(() => {
        // TODO: Fetch patient's name using patientId and set a more descriptive title
        // For now, setting the ID as title
        if (patientId) {
            navigation.setOptions({ title: `Patient ID: ${patientId}` });
        } else {
            navigation.setOptions({ title: 'Patient Details' }); // Fallback title
        }
    }, [navigation, patientId]);

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'summary', title: 'Summary' },
        { key: 'notes', title: 'Notes' },
        { key: 'tasks', title: 'Tasks' },
        { key: 'meds', title: 'Meds' },
        { key: 'history', title: 'History' },
    ]);

    // Function to render the styled TabBar
    const renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled // Allow scrolling if many tabs
            indicatorStyle={styles.indicator} // Use style from StyleSheet
            style={styles.tabBar} // Use style from StyleSheet
            labelStyle={styles.label} // Use style from StyleSheet
            tabStyle={styles.tab} // Use style from StyleSheet
        />
    );

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={renderTabBar} // Use the render function
        />
    );
};

// Styles for the TabView component
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.primary, // Use primary color from theme
  },
  indicator: {
    backgroundColor: COLORS.white, // Indicator color
    height: 3, // Make indicator slightly thicker
  },
  label: {
    ...FONTS.h4, // Apply h4 font style from theme.js
    color: COLORS.white,
    textTransform: 'capitalize', // Keep text capitalized
    marginHorizontal: 0, // Remove default horizontal margin
    paddingHorizontal: 4, // Add padding within the label itself if needed
    textAlign: 'center',
  },
  tab: {
    width: 'auto', // Allow tabs to size based on content
    minWidth: 100, // Ensure minimum width for readability
    paddingHorizontal: SIZES.base, // Use base padding from theme for spacing
    paddingVertical: SIZES.base / 2, // Adjust vertical padding
  },
});


export default PatientDetailScreen;

