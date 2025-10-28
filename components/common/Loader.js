    import React from 'react';
    import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
    import { COLORS } from '../../constants/colors';
    import { FONTS } from '../../constants/theme';

    const Loader = ({ visible }) => (
      <Modal visible={visible} transparent={true}>
        <View style={styles.container}>
          <View style={styles.box}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.text}>Logging in...</Text>
          </View>
        </View>
      </Modal>
    );

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      box: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
      },
      text: {
        ...FONTS.h3,
        color: COLORS.text,
        marginTop: 16,
      },
    });

    export default Loader;
    
