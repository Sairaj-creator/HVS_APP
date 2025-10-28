    import React from 'react';
    import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
    import { MaterialCommunityIcons } from '@expo/vector-icons';
    import { COLORS } from '../../constants/colors';
    import { FONTS, SIZES } from '../../constants/theme';
    import Card from '../common/Card';

    // This component will receive a 'task' object
    // type can be 'alert' or 'task'
    const TaskItem = ({ task, onPress }) => {
      const isAlert = task.type === 'alert';
      const isComplete = task.status === 'complete';

      return (
        <Card style={styles.card}>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={isAlert ? 'alarm-light' : 'clipboard-text-outline'}
                size={24}
                color={isAlert ? COLORS.red : COLORS.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{task.title}</Text>
              <Text style={styles.subtitle}>
                Patient: {task.patientName} (ID: {task.patientId})
              </Text>
            </View>

            <TouchableOpacity style={styles.checkbox} onPress={onPress}>
              <MaterialCommunityIcons
                name={
                  isComplete ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'
                }
                size={30}
                color={isComplete ? COLORS.darkGreen : COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </Card>
      );
    };

    const styles = StyleSheet.create({
      card: {
        marginHorizontal: SIZES.padding,
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconContainer: {
        marginRight: SIZES.padding / 2,
      },
      textContainer: {
        flex: 1, // This makes the text container take up available space
      },
      title: {
        ...FONTS.h3,
        color: COLORS.text,
      },
      subtitle: {
        ...FONTS.body4,
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
      },
      checkbox: {
        paddingLeft: SIZES.base,
      },
    });

    export default TaskItem;
    
