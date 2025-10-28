import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SIZES } from '../../constants/theme';
import StyledButton from '../../components/common/StyledButton';
import { useAuth } from '../../context/AuthContext';
// Import the correct functions from api.js
import { apiAdminGetUserList, apiAdminCreateUser } from '../../services/api.js';
import Card from '../../components/common/Card';

// Placeholder Form - We will build this out fully later
const CreateUserForm = ({ token, onUserCreated }) => {
  return (
    <View>
      <Text style={styles.subHeader}>Create New User</Text>
      <Text>
        (This is a placeholder. We will build a full 'Create User' screen that
        navigates here.)
      </Text>
    </View>
  );
};

const AdminScreen = ({ navigation }) => {
  const { userToken } = useAuth();
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load users when the screen mounts or token changes
  useEffect(() => {
    if (userToken) {
      loadUsers();
    }
  }, [userToken]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Call the new API endpoint
      const users = await apiAdminGetUserList(userToken);
      setUserList(users);
    } catch (error) {
      Alert.alert('Error', `Could not load user list: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={userList}
        keyExtractor={(item) => item.id.toString()} // Assuming backend provides id
        onRefresh={loadUsers} // Enable pull-to-refresh
        refreshing={isLoading}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Admin Panel</Text>
            </View>
            <View style={styles.formContainer}>
              {/* This is where the Admin can create new users */}
              <CreateUserForm token={userToken} onUserCreated={loadUsers} />
            </View>
            <Text style={styles.subHeader}>All Registered Users</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <Text style={styles.userName}>{item.username}</Text>
            <Text style={styles.userRole}>{item.role.toUpperCase()}</Text>
          </Card>
        )}
        ListEmptyComponent={ // Show a message if the list is empty
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        }
      />
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
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  subHeader: {
    ...FONTS.h2,
    color: COLORS.text,
    padding: SIZES.padding,
  },
  userCard: {
    marginHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  userName: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  userRole: {
    ...FONTS.body4,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden', // for iOS text background clipping
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.gray,
  },
});

export default AdminScreen;

