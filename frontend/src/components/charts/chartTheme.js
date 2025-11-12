/**
 * Chart color constants and theme utilities
 */

// Primary chart colors
export const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
};

// Semantic colors
export const SEMANTIC_COLORS = {
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  muted: '#6b7280',
};

// Color array for pie charts and multiple series
export const COLOR_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.cyan,
  CHART_COLORS.orange,
];

// Tooltip base styles
export const TOOLTIP_STYLES = {
  container: {
    backgroundColor: 'white',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  text: {
    margin: 0,
    fontSize: '0.875rem',
  },
};
