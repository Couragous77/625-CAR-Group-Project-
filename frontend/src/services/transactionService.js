import { apiRequest, buildQueryString } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Transaction API Service
 * Handles all API calls related to transactions (expenses and income)
 */

/**
 * List transactions with filters and pagination
 * @param {object} params - Query parameters
 * @param {string} params.type - Transaction type ('expense' or 'income')
 * @param {number} params.page - Page number (1-indexed)
 * @param {number} params.limit - Items per page
 * @param {string} params.sort_by - Field to sort by
 * @param {string} params.sort_order - Sort direction ('asc' or 'desc')
 * @param {string} params.category_id - Filter by category
 * @param {number} params.min_amount - Minimum amount in cents
 * @param {number} params.max_amount - Maximum amount in cents
 * @param {string} params.start_date - Start date (ISO format)
 * @param {string} params.end_date - End date (ISO format)
 * @param {string} params.search - Search term for description
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Paginated transaction list
 */
export async function listTransactions(params, token) {
  const queryString = buildQueryString(params);
  return await apiRequest(`${API_ENDPOINTS.transactions}${queryString}`, {}, token);
}

/**
 * Get a single transaction by ID
 * @param {string} id - Transaction ID
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Transaction details
 */
export async function getTransaction(id, token) {
  return await apiRequest(`${API_ENDPOINTS.transactions}/${id}`, {}, token);
}

/**
 * Create a new transaction
 * @param {object} data - Transaction data
 * @param {string} data.type - 'expense' or 'income'
 * @param {number} data.amount_cents - Amount in cents
 * @param {string} data.category_id - Category UUID
 * @param {string} data.occurred_at - Date (ISO format)
 * @param {string} data.description - Optional description
 * @param {string} data.receipt_url - Optional receipt URL
 * @param {object} data.metadata - Optional metadata
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Created transaction
 */
export async function createTransaction(data, token) {
  return await apiRequest(
    API_ENDPOINTS.transactions,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * Update an existing transaction
 * @param {string} id - Transaction ID
 * @param {object} data - Updated transaction data (same fields as create)
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Updated transaction
 */
export async function updateTransaction(id, data, token) {
  return await apiRequest(
    `${API_ENDPOINTS.transactions}/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  );
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @param {string} token - JWT token
 * @returns {Promise<void>}
 */
export async function deleteTransaction(id, token) {
  return await apiRequest(
    `${API_ENDPOINTS.transactions}/${id}`,
    {
      method: 'DELETE',
    },
    token
  );
}
