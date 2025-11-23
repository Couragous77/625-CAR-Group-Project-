import { API_BASE_URL } from '../config/api';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/transactions')
 * @param {object} options - Fetch options
 * @param {string} token - JWT token (optional, will be added to Authorization header)
 * @returns {Promise<any>} - Response data
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Try to parse response body
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Handle non-OK responses
    if (!response.ok) {
      throw new APIError(
        data?.detail || data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }
    
    return data;
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError(
      error.message || 'Network request failed',
      0,
      null
    );
  }
}

/**
 * Build query string from params object
 * @param {object} params - Query parameters
 * @returns {string} - Query string (e.g., '?page=1&limit=20')
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
