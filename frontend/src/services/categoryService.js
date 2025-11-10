import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Category API Service
 * Handles all API calls related to categories
 */

/**
 * List all categories for the current user
 * @param {string} token - JWT token
 * @returns {Promise<Array>} - List of categories
 */
export async function listCategories(token) {
  // TODO: Implement when backend category endpoint is ready
  // return await apiRequest(API_ENDPOINTS.categories, {}, token);
  
  // For now, return mock categories
  return [
    { id: '1', name: 'Textbooks', user_id: null, is_default: true },
    { id: '2', name: 'Tuition', user_id: null, is_default: true },
    { id: '3', name: 'Rent', user_id: null, is_default: true },
    { id: '4', name: 'Food', user_id: null, is_default: true },
    { id: '5', name: 'Entertainment', user_id: null, is_default: true },
    { id: '6', name: 'Transportation', user_id: null, is_default: true },
    { id: '7', name: 'Misc', user_id: null, is_default: true },
  ];
}

/**
 * Create a new custom category
 * @param {object} data - Category data
 * @param {string} data.name - Category name
 * @param {number} data.monthly_limit_cents - Optional monthly limit
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Created category
 */
export async function createCategory(data, token) {
  // TODO: Implement when backend category endpoint is ready
  // return await apiRequest(
  //   API_ENDPOINTS.categories,
  //   {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   },
  //   token
  // );
  
  // For now, return mock category
  return {
    id: String(Date.now()),
    name: data.name,
    user_id: 'current-user-id',
    is_default: false,
    monthly_limit_cents: data.monthly_limit_cents || null,
  };
}
