/**
 * Currency utility functions
 */

/**
 * Convert dollars to cents
 * @param {number|string} dollars - Dollar amount
 * @returns {number} - Amount in cents
 */
export function dollarsToCents(dollars) {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Convert cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} - Amount in dollars
 */
export function centsToDollars(cents) {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param {number} cents - Amount in cents
 * @returns {string} - Formatted currency (e.g., "$12.99")
 */
export function formatCurrency(cents) {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}
