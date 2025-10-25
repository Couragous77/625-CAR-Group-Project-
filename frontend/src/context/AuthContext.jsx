import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mock auth state - replace with real auth later
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // Mock login - replace with actual API call later
    setIsAuthenticated(true);
    setUser(userData || {
      email: 'user@school.edu',
      firstName: 'Budget',
      lastName: 'CAR',
      avatar: null // Will be gravatar URL or null
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = (userData) => {
    // Mock register - replace with actual API call later
    setIsAuthenticated(true);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
