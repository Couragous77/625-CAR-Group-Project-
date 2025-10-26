import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper functions for JWT token management
const TOKEN_KEY = 'budget_car_token';
const USER_KEY = 'budget_car_user';

// Mock JWT token generation (for development)
function generateMockToken(userData) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userData.email,
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

// Decode JWT payload (works with both mock and real tokens)
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

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (token && storedUser && !isTokenExpired(token)) {
        // Valid token exists, restore auth state
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } else {
        // No valid token, clear any stale data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    // TODO: Replace with actual API call to POST /api/auth/login
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // const { token, user } = await response.json();

    // Mock login - generate fake JWT token
    const mockToken = generateMockToken(userData);
    const userToStore = userData || {
      email: 'user@school.edu',
      firstName: 'Budget',
      lastName: 'CAR',
      avatar: null
    };

    // Store token and user in localStorage
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userToStore));

    setIsAuthenticated(true);
    setUser(userToStore);
  };

  const logout = () => {
    // TODO: Optionally call backend to invalidate token
    // await fetch('/api/auth/logout', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // Clear token and user from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setIsAuthenticated(false);
    setUser(null);
  };

  const register = (userData) => {
    // TODO: Replace with actual API call to POST /api/auth/register
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    // const { token, user } = await response.json();

    // Mock register - generate fake JWT token
    const mockToken = generateMockToken(userData);

    // Store token and user in localStorage
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setIsAuthenticated(true);
    setUser(userData);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      register,
      getToken
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
