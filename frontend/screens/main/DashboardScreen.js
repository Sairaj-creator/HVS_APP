import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  SectionList,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import TaskItem from '../../components/patient/TaskItem';

// MOCK DATA for the dashboard
// Later, this will come from the backend based on all patient data
const MOCK_TASKS = [
  {
    id: 'T-001',
    type: 'alert', // 'alert' tasks will go in the top section
    title: 'Give Pain Medication',
    patientName: 'John Smith',
    patientId: 'P-24680',
    dueTime: '10:30 AM',
    status: 'pending',
  },
  {
    id: 'T-002',
    type: 'task',
    title: 'Check BP',
    patientName: 'Jane Doe',
    patientId: 'P-67890',
    dueTime: '11:00 AM',
    status: 'pending',
  },
  {
    id: 'T-003',
    type: 'task',
    title: 'Change Glucose Tag',
    patientName: 'Sairaj Patil',
    patientId: 'P-12345',
    dueTime: '11:15 AM',
    status: 'pending',
  },
  {
    id: 'T-004',
    type: 'task',
    title: 'Check Vitals',
    patientName: 'John Smith',
    patientId: 'P-24680',
    dueTime: '12:00 PM',
    status: 'complete', // This one will show as checked
  },
];

const DashboardScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState(MOCK_TASKS);

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

  // We need to split our tasks into "Alerts" and "Today's Tasks"
  const alerts = tasks.filter((task) => task.type === 'alert' && task.status === 'pending');
  const todayTasks = tasks.filter((task) => task.type === 'task');

  // We will use a SectionList to make this easy
  const DATA = [
    {
      title: 'Urgent Alerts',
      data: alerts,
    },
    {
      title: "Today's Tasks",
      data: todayTasks,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onPress={() => toggleTaskComplete(item.id)} />
        )}
        renderSectionHeader={({ section: { title, data } }) =>
          // Only show the header if there are items in that section
          data.length > 0 ? (
            <Text style={styles.header}>{title}</Text>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Doctor's Dashboard</Text>
            <Text style={styles.subtitle}>
              You have {alerts.length} urgent alert(s) and {todayTasks.length}{' '}
              task(s) today.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SIZES.padding }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  titleContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.text,
    marginTop: SIZES.base,
  },
  header: {
    ...FONTS.h2,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
});

export default DashboardScreen;

