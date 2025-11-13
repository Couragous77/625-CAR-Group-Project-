/**
 * Authentication Service
 * 
 * API calls for user authentication and password management.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.first_name - User first name
 * @param {string} userData.last_name - User last name
 * @returns {Promise<Object>} Registration response with tokens
 */
export async function registerUser({ email, password, first_name, last_name }) {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      first_name,
      last_name,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    const errorMessage = error.detail || 'Registration failed';
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with access_token
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Invalid email or password');
  }

  const data = await response.json();
  return data; // { access_token, token_type }
}

/**
 * Get current user profile
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} User profile data
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch user' }));
    throw new Error(error.detail || 'Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset request response
 */
export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE_URL}/api/password_reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to send reset email' }));
    throw new Error(error.detail || 'Failed to send reset email');
  }

  return response.json();
}

/**
 * Confirm password reset with token
 * @param {Object} data - Reset confirmation data
 * @param {string} data.token - Reset token from email
 * @param {string} data.new_password - New password
 * @returns {Promise<Object>} Confirmation response
 */
export async function confirmPasswordReset({ token, new_password }) {
  const response = await fetch(`${API_BASE_URL}/api/password_reset/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      new_password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to reset password' }));
    throw new Error(error.detail || 'Failed to reset password');
  }

  return response.json();
}
