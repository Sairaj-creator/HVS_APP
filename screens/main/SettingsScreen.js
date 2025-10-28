import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledButton from '../../components/common/StyledButton';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = () => {
  // We get the signOut function from our AuthContext
  const { signOut, userId } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.info}>Logged in as:</Text>
        <Text style={styles.userId}>{userId || 'N/A'}</Text>
        <View style={{ height: 40 }} />
        <StyledButton title="Sign Out" onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  userId: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
});

export default SettingsScreen;

