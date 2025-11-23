import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Category API Service
 * Handles all API calls related to categories/envelopes
 */

/**
 * List all categories for the current user
 * @param {string} token - JWT token
 * @param {string} type - Optional filter by type ('income' or 'expense')
 * @returns {Promise<Array>} - List of categories
 */
export async function listCategories(token, type = null) {
  const url = type ? `${API_ENDPOINTS.categories}?type=${type}` : API_ENDPOINTS.categories;
  return await apiRequest(url, {}, token);
}

/**
 * Get a single category by ID
 * @param {string} categoryId - Category UUID
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Category data
 */
export async function getCategory(categoryId, token) {
  return await apiRequest(`${API_ENDPOINTS.categories}/${categoryId}`, {}, token);
}

/**
 * Create a new custom category/envelope
 * @param {object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type ('income' or 'expense')
 * @param {number} data.monthly_limit_cents - Optional monthly limit in cents
 * @param {boolean} data.is_default - Whether this is a default category
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Created category
 */
export async function createCategory(data, token) {
  return await apiRequest(
    API_ENDPOINTS.categories,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * Update an existing category/envelope
 * @param {string} categoryId - Category UUID
 * @param {object} data - Updated category data
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type ('income' or 'expense')
 * @param {number} data.monthly_limit_cents - Optional monthly limit in cents
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Updated category
 */
export async function updateCategory(categoryId, data, token) {
  return await apiRequest(
    `${API_ENDPOINTS.categories}/${categoryId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * Delete a category/envelope
 * @param {string} categoryId - Category UUID
 * @param {string} token - JWT token
 * @returns {Promise<void>}
 */
export async function deleteCategory(categoryId, token) {
  return await apiRequest(
    `${API_ENDPOINTS.categories}/${categoryId}`,
    {
      method: 'DELETE',
    },
    token
  );
}
