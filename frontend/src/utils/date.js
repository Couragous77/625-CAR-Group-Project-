/**
 * Date utility functions
 */

/**
 * Format date as "Jan 7, 2025"
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today's date in YYYY-MM-DD format (for input[type="date"])
 * @returns {string} - Today's date
 */
export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert Date to YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export function toDateInputString(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Convert date string to ISO 8601 format for API
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - ISO 8601 date-time string
 */
export function toISOString(dateString) {
  if (!dateString) return '';
  // Append time to make it a full datetime
  return new Date(dateString + 'T00:00:00').toISOString();
}
