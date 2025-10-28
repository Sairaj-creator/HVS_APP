import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Alert, Text } from 'react-native'; // Added Text
import { useRoute } from '@react-navigation/native';
// Correctly import theme components (assuming theme.js is correct and exports FONTS)
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import NoteCard from '../../components/patient/NoteCard';
import StyledButton from '../../components/common/StyledButton';
import { useAuth } from '../../context/AuthContext';
// Import API functions
import { requestAudioPermissions, getPatientNotes } from '../../services/api.js';

// MOCK DATA - Will be replaced by API call
const MOCK_NOTES = [
    {
        id: 'N-001',
        type: 'handoff',
        author: 'Dr. Anya Sharma (Shift End)',
        timestamp: '2025-10-26 14:30',
        transcript:
        'Patient is a 45-year-old male, admitted for chest pain. Vitals are stable. Pain is 3/10 after morphine. Awaiting troponin results, expected at 15:00. Code status is Full Code.',
    },
    {
        id: 'N-002',
        type: 'note',
        author: 'Dr. Ben Chen (Cardiology)',
        timestamp: '2025-10-26 11:15',
        transcript:
        'Initial consult complete. EKG shows no acute ST elevation. Will proceed with a stress test once troponin results are confirmed negative.',
    },
];

const PatientNotesScreen = ({ navigation }) => {
    const { userToken } = useAuth();
    const route = useRoute();
    const patientId = route.params?.patientId;

    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (userToken && patientId) {
                loadNotes();
            }
        });
        if (userToken && patientId) {
            loadNotes();
        }
        return unsubscribe;
    }, [navigation, userToken, patientId]);

    const loadNotes = async () => {
        setIsLoading(true);
        console.log(`Loading notes for patient: ${patientId}`);
        try {
            // Replace MOCK_NOTES with the actual API call when backend is ready
            // const fetchedNotes = await getPatientNotes(patientId, userToken);
            // setNotes(fetchedNotes);
            setNotes(MOCK_NOTES); // Using mock data for now
        } catch (error) {
            Alert.alert('Error', `Could not load notes: ${error.message}`);
            setNotes(MOCK_NOTES); // Fallback to mock data on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartHandoff = async () => {
        const permissionGranted = await requestAudioPermissions();
        if (permissionGranted && patientId) {
            navigation.navigate('Recording', { patientId: patientId });
        } else if (!patientId) {
            Alert.alert("Error", "Patient ID is missing.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notes}
                renderItem={({ item }) => <NoteCard note={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                onRefresh={loadNotes}
                refreshing={isLoading}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No notes found for this patient.</Text>
                        </View>
                    )
                }
            />
            <View style={styles.buttonContainer}>
                <StyledButton
                    title="Start New Handoff / Add Note"
                    onPress={handleStartHandoff}
                    disabled={!patientId}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray, // Use theme color
    },
    list: {
        paddingTop: SIZES.padding,
        paddingBottom: 100, // Make space for the button
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SIZES.padding,
        backgroundColor: COLORS.white, // Use theme color
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray, // Use theme color
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: SIZES.padding * 2,
    },
    emptyText: {
         // Use FONTS from theme.js
        ...FONTS.body3, // Ensure FONTS is available
        color: COLORS.gray, // Use theme color
    },
});

export default PatientNotesScreen;

