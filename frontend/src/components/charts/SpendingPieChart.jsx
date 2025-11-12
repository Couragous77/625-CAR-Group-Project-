import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import ChartEmptyState from './ChartEmptyState';
import { COLOR_PALETTE, TOOLTIP_STYLES, SEMANTIC_COLORS } from './chartTheme';

/**
 * SpendingPieChart - Display category spending breakdown
 * 
 * @param {Object} props
 * @param {Array} props.data - Aggregated category data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message when no data
 */
export default function SpendingPieChart({ data = [], loading = false, emptyMessage = 'No spending data available' }) {
  
  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.category_name,
    value: item.total_cents / 100, // Convert to dollars
    totalCents: item.total_cents,
    count: item.count,
  }));

  // Custom label renderer for pie slices
  const renderLabel = (entry) => {
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={TOOLTIP_STYLES.container}>
          <p style={TOOLTIP_STYLES.title}>
            {data.name}
          </p>
          <p style={{ margin: 0, color: SEMANTIC_COLORS.success }}>
            {formatCurrency(data.totalCents)}
          </p>
          <p style={{ ...TOOLTIP_STYLES.text, color: SEMANTIC_COLORS.muted, marginTop: '4px' }}>
            {data.count} transaction{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || !chartData || chartData.length === 0) {
    return <ChartEmptyState loading={loading} message={emptyMessage} />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span style={{ color: '#374151', fontSize: '0.875rem' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
