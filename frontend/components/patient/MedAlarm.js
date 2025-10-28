    import React from 'react';
    import { View, Text, StyleSheet } from 'react-native';
    import { MaterialCommunityIcons } from '@expo/vector-icons';
    import { COLORS } from '../../constants/colors';
    import { FONTS, SIZES } from '../../constants/theme';
    import Card from '../common/Card';

    // This component will receive a 'med' object
    const MedAlarm = ({ med }) => {
      const isPastDue = med.status === 'past_due';
      const isComplete = med.status === 'complete';
      const isUpcoming = med.status === 'upcoming';

      return (
        <Card
          style={[
            styles.card,
            isPastDue && styles.pastDueCard, // Highlight past due meds
          ]}
        >
          <View style={styles.container}>
            <MaterialCommunityIcons
              name={isComplete ? 'pill-off' : 'pill'}
              size={30}
              color={isPastDue ? COLORS.red : isUpcoming ? COLORS.primary : COLORS.gray}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{med.name}</Text>
              <Text style={styles.details}>Dosage: {med.dosage}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{med.time}</Text>
              {isPastDue && <Text style={styles.statusText}>PAST DUE</Text>}
              {isComplete && <Text style={styles.statusText}>ADMINISTERED</Text>}
            </View>
          </View>
        </Card>
      );
    };

    const styles = StyleSheet.create({
      card: {
        marginHorizontal: SIZES.padding,
      },
      pastDueCard: {
        backgroundColor: COLORS.lightRed,
        borderColor: COLORS.red,
        borderWidth: 1,
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      textContainer: {
        flex: 1,
        marginLeft: SIZES.padding / 2,
      },
      title: {
        ...FONTS.h3,
        color: COLORS.text,
      },
      details: {
        ...FONTS.body4,
        color: COLORS.gray,
        marginTop: 4,
      },
      timeContainer: {
        alignItems: 'flex-end',
      },
      timeText: {
        ...FONTS.h3,
        color: COLORS.primary,
      },
      statusText: {
        ...FONTS.body4,
        fontSize: 10,
        color: COLORS.red,
        fontWeight: 'bold',
        marginTop: 4,
      },
    });

    export default MedAlarm;
    
