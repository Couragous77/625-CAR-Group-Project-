/**
 * Aggregation Service
 * 
 * API calls for transaction aggregation and analytics data.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get transaction aggregates
 * @param {Object} params - Query parameters
 * @param {string} params.groupBy - 'category' or 'period'
 * @param {string} params.period - 'weekly', 'monthly', or 'yearly'
 * @param {string} params.startDate - ISO date string
 * @param {string} params.endDate - ISO date string
 * @param {string} params.type - 'income' or 'expense'
 * @param {Array<string>} params.categoryIds - Array of category UUIDs
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Aggregated data
 */
export async function getAggregates(params = {}, token) {
  const queryParams = new URLSearchParams();
  
  if (params.groupBy) queryParams.append('group_by', params.groupBy);
  if (params.period) queryParams.append('period', params.period);
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.type) queryParams.append('type', params.type);
  
  // Handle multiple category IDs
  if (params.categoryIds && Array.isArray(params.categoryIds)) {
    params.categoryIds.forEach(id => {
      queryParams.append('category_ids[]', id);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/api/transactions/aggregates?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch aggregates' }));
    
    // Handle validation errors (422)
    if (response.status === 422 && error.detail) {
      // FastAPI validation errors come as an array
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        throw new Error(`Validation error: ${messages}`);
      }
      throw new Error(error.detail);
    }
    
    throw new Error(error.detail || `Failed to fetch aggregates (${response.status})`);
  }

  return response.json();
}

/**
 * Get spending breakdown by category
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - ISO date string
 * @param {string} params.endDate - ISO date string
 * @param {string} params.type - 'income' or 'expense'
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Category aggregates
 */
export async function getSpendingByCategory(params = {}, token) {
  return getAggregates({
    ...params,
    groupBy: 'category',
    period: 'monthly', // Default period
  }, token);
}

/**
 * Get trends over time period
 * @param {Object} params - Query parameters
 * @param {string} params.period - 'weekly', 'monthly', or 'yearly'
 * @param {string} params.startDate - ISO date string
 * @param {string} params.endDate - ISO date string
 * @param {string} params.type - 'income' or 'expense'
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Period aggregates
 */
export async function getTrendsByPeriod(params = {}, token) {
  return getAggregates({
    ...params,
    groupBy: 'period',
    period: params.period || 'weekly',
  }, token);
}
