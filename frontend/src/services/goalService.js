import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';

/**
 * List goals for the current user.
 * @param {string} token - JWT token
 * @returns {Promise<Array>} - List of goals
 */
export async function listGoals(token) {
  return await apiRequest(API_ENDPOINTS.goals, {}, token);
}

/**
 * Create a new goal.
 * @param {object} data - Goal data
 * @param {string} data.name - Goal name
 * @param {number} data.target_cents - Target amount in cents
 * @param {string|null} data.target_date - Optional ISO date
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Created goal
 */
export async function createGoal(data, token) {
  return await apiRequest(
    API_ENDPOINTS.goals,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  );
}
