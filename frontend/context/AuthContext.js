import React from 'react';
import { Alert } from 'react-native';
import { apiLogin, MOCK } from '../services/api.js'; // Use api.js

// Use the default React import and reference hooks via React.* to avoid
// potential bundler/destructuring issues that can cause `useContext` to be null.
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = React.useState(MOCK ? 'mock-token-1' : null);
  const [user, setUser] = React.useState(null);
  const [role, setRole] = React.useState(MOCK ? 'admin' : null);
  const [isLoading, setIsLoading] = React.useState(true); // Start loading initially

  // Check for saved token on app start (we'll build this later)
  React.useEffect(() => {
    // If running in MOCK mode we pre-set a mock token above; now try to
    // resolve the user details from the mock DB so UI can show role/name.
    const init = async () => {
      if (MOCK) {
        try {
          const mockDb = await import('../services/mockDb');
          // Seed sample data (idempotent) so dashboard shows content during dev
          try {
            await mockDb.seedSampleData();
            console.log('AuthContext: seeded mock sample data');
          } catch (e) {
            console.warn('AuthContext: failed to seed mock data', e);
          }

          if (userToken) {
            try {
              const u = await mockDb.getUserFromToken(userToken);
              if (u) {
                setUser(u);
                setRole(u.role || null);
                console.log('AuthContext: mock user loaded', u.username, u.role);
              }
            } catch (e) {
              console.warn('AuthContext: failed to load mock user info', e);
            }
          }
        } catch (e) {
          console.warn('AuthContext: mock DB import failed', e);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const signIn = async (username, password) => {
    setIsLoading(true);
    const token = await apiLogin(username, password);
    if (token) {
      setUserToken(token);
      // in mock mode try to get user info
      if (MOCK) {
        try {
          const { getUserFromToken } = await import('../services/mockDb');
          const u = await getUserFromToken(token);
          if (u) {
            setUser(u);
            setRole(u.role || null);
          }
        } catch (e) {
          console.warn('AuthContext: signIn: failed to load mock user info', e);
        }
      }
      // We don't need to decode the role here anymore
    }
    setIsLoading(false);
  };

  const signOut = () => {
    setUserToken(null);
    setUser(null);
    setRole(null);
    // We would also clear the token from secure storage
  };

  return (
    <AuthContext.Provider
      // Provide token, loading, signIn, signOut and role/user for consumers
      value={{ userToken, user, role, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  // Use React.useContext explicitly
  return React.useContext(AuthContext);
};

