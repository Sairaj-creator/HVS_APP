import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  Alert, // 1. Import Alert
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES, FONTS } from '../../constants/theme';
import StyledTextInput from '../../components/common/StyledTextInput';
import PatientCard from '../../components/patient/PatientCard';
import { useAuth } from '../../context/AuthContext'; // 2. Import useAuth
import { getPatients } from '../../services/api.js'; // 3. Import from 'api.js'

const PatientListScreen = ({ navigation }) => {
  const { userToken } = useAuth(); // 4. Get the login token
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 5. This will now load REAL data from the backend
  useEffect(() => {
    if (userToken) {
      loadPatients();
    }
  }, [userToken]); // Reload if the token changes

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getPatients(userToken);
      setAllPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load patients.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. This effect will run every time the user types in the search box
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredPatients(allPatients);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allPatients.filter(
        (patient) =>
          // 7. Use the backend's field names
          patient.full_name.toLowerCase().includes(lowerCaseQuery) ||
          patient.patient_id.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, allPatients]);

  const renderPatientCard = ({ item }) => (
    <PatientCard
      patient={item} // Pass the new patient object
      onPress={() =>
        navigation.navigate('PatientDetail', {
          patientId: item.patient_id, // 8. Pass the correct ID
        })
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Directory</Text>
        <View style={styles.searchContainer}>
          <StyledTextInput
            label="Search Patients"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.patient_id} // 9. Use the correct ID
        contentContainerStyle={{ paddingBottom: SIZES.padding }}
        onRefresh={loadPatients} // Add "pull-to-refresh"
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  searchContainer: {
    marginTop: SIZES.base,
  },
});

export default PatientListScreen;

