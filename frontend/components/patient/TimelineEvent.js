    import React from 'react';
    import { View, Text, StyleSheet } from 'react-native';
    import { COLORS } from '../../constants/colors';
    import { FONTS, SIZES } from '../../constants/theme';
    import Card from '../common/Card';

    // This component receives the 'event' and 'isLast' (a boolean)
    const TimelineEvent = ({ event, isLast }) => {
      return (
        <View style={styles.container}>
          {/* This is the left column with the dot and line */}
          <View style={styles.timelineContainer}>
            <View style={styles.dot} />
            {!isLast && <View style={styles.line} />}
          </View>

          {/* This is the right column with the content card */}
          <View style={styles.contentContainer}>
            <Card style={styles.card}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.timestamp}>{event.timestamp}</Text>
              {event.details && (
                <Text style={styles.details}>{event.details}</Text>
              )}
            </Card>
          </View>
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding,
      },
      timelineContainer: {
        width: 30, // Width for the dot and line
        alignItems: 'center',
      },
      dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        zIndex: 1, // Make sure dot is on top of the line
      },
      line: {
        width: 2,
        flex: 1, // Stretches to fill the space
        backgroundColor: COLORS.primary,
        marginTop: -8, // Pulls the line up to meet the dot
      },
      contentContainer: {
        flex: 1,
        paddingBottom: SIZES.padding,
        paddingLeft: SIZES.base,
      },
      card: {
        marginTop: -8, // Aligns the card with the dot
        width: '100%',
      },
      title: {
        ...FONTS.h3,
        color: COLORS.text,
      },
      timestamp: {
        ...FONTS.body4,
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
        marginBottom: SIZES.base,
      },
      details: {
        ...FONTS.body4,
        color: COLORS.text,
        lineHeight: 20,
      },
    });

    export default TimelineEvent;
    
