/**
 * ChartEmptyState - Reusable empty/loading state for charts
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Show loading state
 * @param {string} props.message - Message to display when empty
 * @param {React.ReactNode} props.icon - Custom icon (optional)
 */
export default function ChartEmptyState({ loading = false, message = 'No data available', icon }) {
  const containerStyle = {
    width: '100%',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p className="muted">Loading chart...</p>
      </div>
    );
  }

  // Default icon if none provided
  const defaultIcon = (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9ca3af' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div style={containerStyle}>
      {icon || defaultIcon}
      <p className="muted">{message}</p>
    </div>
  );
}
