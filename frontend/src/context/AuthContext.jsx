import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, updateProfile } from '../services/authService';

const AuthContext = createContext(null);

// Helper functions for JWT token management
const TOKEN_KEY = 'budget_car_token';
const USER_KEY = 'budget_car_user';

// Decode JWT payload
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

function normalizeUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.first_name ?? '',
    lastName: apiUser.last_name ?? '',
    studentStatus: apiUser.student_status ?? '',
    role: apiUser.role,
    goals: apiUser.goals || [],
  };
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (token && !isTokenExpired(token)) {
        try {
          // Fetch fresh user data from API
          const apiUser = await getCurrentUser(token);
          const userData = normalizeUser(apiUser);
          setIsAuthenticated(true);
          setUser(userData);
          // Update stored user data
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          console.error('Error details:', error.message);
          // Token might be invalid, clear auth state
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // No valid token, clear any stale data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      // Call real API
      const response = await loginUser({ email, password });
      const token = response.access_token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, token);

      // Fetch user profile
      const apiUser = await getCurrentUser(token);
      const userData = normalizeUser(apiUser);
      
      // Store user data
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      // Clear any stale data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error; // Re-throw so Login component can handle it
    }
  };

  const logout = () => {
    // Clear token and user from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async ({ email, password, firstName, lastName }) => {
    try {
      // Call real API - register endpoint (returns tokens directly)
      const response = await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      // Extract token from registration response
      const token = response.access_token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, token);

      // Fetch user profile using the token
      const apiUser = await getCurrentUser(token);
      const userData = normalizeUser(apiUser);
      
      // Store user data
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      // Clear any stale data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error; // Re-throw so Register component can handle it
    }
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const saveProfile = async (profile) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const apiUser = await updateProfile(profile, token);
    const userData = normalizeUser(apiUser);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      register,
      getToken,
      saveProfile,
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
