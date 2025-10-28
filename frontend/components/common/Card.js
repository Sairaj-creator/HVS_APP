    import React from 'react';
    import { View, StyleSheet } from 'react-native';
    import { COLORS } from '../../constants/colors';
    import { SIZES, SHADOWS } from '../../constants/theme';

    const Card = ({ children, style }) => {
      return <View style={[styles.card, style]}>{children}</View>;
    };

    const styles = StyleSheet.create({
      card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding / 1.5, // A little less padding
        marginVertical: SIZES.base,
        ...SHADOWS.light,
      },
    });

    export default Card;
    
