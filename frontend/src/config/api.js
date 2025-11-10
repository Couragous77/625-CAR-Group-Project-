// API Configuration
// Default to backend running in Docker, but allow override via environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  forgotPassword: '/api/auth/forgot-password',
  
  // Transactions
  transactions: '/api/transactions',
  
  // Categories (future)
  categories: '/api/categories',
};
