import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { apiLogin } from '../services/api.js'; // Use api.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  // Check for saved token on app start (we'll build this later)
  useEffect(() => {
    // For now, just set loading to false immediately
    setIsLoading(false);
  }, []);

  const signIn = async (username, password) => {
    setIsLoading(true);
    const token = await apiLogin(username, password);
    if (token) {
      setUserToken(token);
      // We don't need to decode the role here anymore
    }
    setIsLoading(false);
  };

  const signOut = () => {
    setUserToken(null);
    // We would also clear the token from secure storage
  };

  return (
    <AuthContext.Provider
      // We only provide token, loading, signIn, signOut
      value={{ userToken, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

