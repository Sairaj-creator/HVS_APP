    import React from 'react';
    import { TouchableOpacity, Text, StyleSheet } from 'react-native';
    import { COLORS } from '../../constants/colors';
    import { SIZES, FONTS, SHADOWS } from '../../constants/theme';

    const StyledButton = ({ title, onPress }) => {
      return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      );
    };

    const styles = StyleSheet.create({
      button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SIZES.padding,
        width: '100%',
        ...SHADOWS.medium,
      },
      buttonText: {
        ...FONTS.h3,
        color: COLORS.white,
      },
    });

    export default StyledButton;
    
