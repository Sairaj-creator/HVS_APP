    import React from 'react';
    import { View, Text, StyleSheet } from 'react-native';
    import { MaterialCommunityIcons } from '@expo/vector-icons';
    import { COLORS } from '../../constants/colors';
    import { FONTS, SIZES } from '../../constants/theme';
    import Card from '../common/Card';

    // This component will receive a 'note' object
    const NoteCard = ({ note }) => {
      return (
        <Card style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={note.type === 'handoff' ? 'account-voice' : 'note-text-outline'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.title}>
              {note.type === 'handoff' ? 'Handoff Note' : 'Doctor\'s Note'}
            </Text>
          </View>
          <Text style={styles.transcript}>{note.transcript}</Text>
          <View style={styles.footer}>
            <Text style={styles.meta}>By: {note.author}</Text>
            <Text style={styles.meta}>{note.timestamp}</Text>
          </View>
        </Card>
      );
    };

    const styles = StyleSheet.create({
      card: {
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.base,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.base,
      },
      title: {
        ...FONTS.h3,
        color: COLORS.primary,
        marginLeft: SIZES.base,
      },
      transcript: {
        ...FONTS.body4,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: SIZES.padding,
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      meta: {
        ...FONTS.body4,
        fontSize: 12,
        color: COLORS.gray,
      },
    });

    export default NoteCard;
    
