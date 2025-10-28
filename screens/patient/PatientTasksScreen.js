import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import TaskItem from '../../components/patient/TaskItem';
import StyledButton from '../../components/common/StyledButton';

// MOCK DATA for this specific patient
// In the future, we'll get this from the backend
const MOCK_PATIENT_TASKS = [
  {
    id: 'T-101',
    type: 'task',
    title: 'Check BP',
    patientName: 'Sairaj Patil', // Not really needed here, but TaskItem uses it
    patientId: 'P-12345',
    status: 'pending',
  },
  {
    id: 'T-102',
    type: 'task',
    title: 'Change Glucose Tag',
    patientName: 'Sairaj Patil',
    patientId: 'P-12345',
    status: 'pending',
  },
  {
    id: 'T-103',
    type: 'alert',
    title: 'Give Pain Medication',
    patientName: 'Sairaj Patil',
    patientId: 'P-12345',
    status: 'complete',
  },
];

const PatientTasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState(MOCK_PATIENT_TASKS);

  // This function will toggle the 'complete' status
  const toggleTaskComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'pending' ? 'complete' : 'pending',
            }
          : task
      )
    );
  };

  const handleAddTask = () => {
    // This will open a new form/modal later
    console.log('Add new task for this patient');
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskItem task={item} onPress={() => toggleTaskComplete(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.title}>Patient Task List</Text>
        }
        contentContainerStyle={styles.list}
      />
      <View style={styles.buttonContainer}>
        <StyledButton title="Add New Task" onPress={handleAddTask} />
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
    paddingTop: SIZES.padding,
    paddingBottom: 100, // Make space for the button
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
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

export default PatientTasksScreen;

