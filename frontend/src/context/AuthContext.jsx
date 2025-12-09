import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, updateProfile } from '../services/authService';

const AuthContext = createContext(null);

// Helper functions for JWT token management
const TOKEN_KEY = 'budget_car_token';
const USER_KEY = 'budget_car_user';
const WEEKLY_GOAL_KEY = "budgetcar_weekly_savings_goal"; 

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

      if (token && !isTokenExpired(token)) {
        try {
          const apiUser = await getCurrentUser(token);
          const userData = normalizeUser(apiUser);
          setIsAuthenticated(true);
          setUser(userData);

          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(WEEKLY_GOAL_KEY); 
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(WEEKLY_GOAL_KEY); 
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await loginUser({ email, password });
      const token = response.access_token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      localStorage.setItem(TOKEN_KEY, token);

      const apiUser = await getCurrentUser(token);
      const userData = normalizeUser(apiUser);

      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      localStorage.removeItem(WEEKLY_GOAL_KEY); 

      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(WEEKLY_GOAL_KEY); 
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(WEEKLY_GOAL_KEY); 

    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async ({ email, password, firstName, lastName }) => {
    try {
      const response = await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      const token = response.access_token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      localStorage.setItem(TOKEN_KEY, token);

      const apiUser = await getCurrentUser(token);
      const userData = normalizeUser(apiUser);

      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      localStorage.removeItem(WEEKLY_GOAL_KEY); 

      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(WEEKLY_GOAL_KEY); 
      throw error;
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
