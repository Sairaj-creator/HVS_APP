    import React from 'react';
    import { View, TextInput, StyleSheet, Text } from 'react-native';
    import { COLORS } from '../../constants/colors';
    import { SIZES, FONTS } from '../../constants/theme';

    const StyledTextInput = ({ label, multiline, ...props }) => {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              multiline && { height: 120, textAlignVertical: 'top' },
            ]}
            placeholderTextColor={COLORS.gray}
            multiline={multiline}
            {...props}
          />
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        width: '100%',
        marginVertical: 12,
      },
      label: {
        ...FONTS.h4,
        color: COLORS.primary,
        marginBottom: SIZES.base,
      },
      input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        ...FONTS.body3,
        color: COLORS.text,
      },
    });

    export default StyledTextInput;
    
