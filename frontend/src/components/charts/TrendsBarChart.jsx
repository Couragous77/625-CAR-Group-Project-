import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import ChartEmptyState from './ChartEmptyState';
import { SEMANTIC_COLORS, TOOLTIP_STYLES } from './chartTheme';

/**
 * TrendsBarChart - Display spending and net savings trends over time
 * 
 * @param {Object} props
 * @param {Array} props.data - Aggregated period data (must include both income and expense)
 * @param {string} props.period - 'weekly', 'monthly', or 'yearly'
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message when no data
 */
export default function TrendsBarChart({ 
  data = [], 
  period = 'weekly',
  loading = false, 
  emptyMessage = 'No trend data available' 
}) {
  
  // Group data by period to calculate spending, income, and net savings
  const periodMap = new Map();
  
  data.forEach(item => {
    const key = item.period_start;
    if (!periodMap.has(key)) {
      periodMap.set(key, {
        period: key,
        periodEnd: item.period_end,
        income: 0,
        expenses: 0,
      });
    }
    
    const periodData = periodMap.get(key);
    if (item.type === 'income') {
      periodData.income += item.total_cents / 100;
    } else if (item.type === 'expense') {
      periodData.expenses += item.total_cents / 100;
    }
  });
  
  // Convert to array and calculate net savings
  const chartData = Array.from(periodMap.values())
    .map(item => ({
      ...item,
      netSavings: item.income - item.expenses,
    }))
    .sort((a, b) => new Date(a.period) - new Date(b.period));

  // Format period label based on period type
  const formatPeriodLabel = (dateString) => {
    const date = new Date(dateString);
    
    if (period === 'weekly') {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    } else if (period === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else { // yearly
      return date.getFullYear().toString();
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ ...TOOLTIP_STYLES.container, minWidth: '180px' }}>
          <p style={{ ...TOOLTIP_STYLES.title, marginBottom: '8px' }}>
            {formatPeriodLabel(label)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...TOOLTIP_STYLES.text, color: SEMANTIC_COLORS.success }}>Income:</span>
              <strong style={{ color: SEMANTIC_COLORS.success }}>{formatCurrency(data.income * 100)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...TOOLTIP_STYLES.text, color: SEMANTIC_COLORS.danger }}>Expenses:</span>
              <strong style={{ color: SEMANTIC_COLORS.danger }}>{formatCurrency(data.expenses * 100)}</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <span style={{ ...TOOLTIP_STYLES.text, fontWeight: 'bold' }}>Net Savings:</span>
              <strong style={{ 
                color: data.netSavings >= 0 ? SEMANTIC_COLORS.success : SEMANTIC_COLORS.danger
              }}>
                {formatCurrency(data.netSavings * 100)}
              </strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading || !chartData || chartData.length === 0) {
    const icon = (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9ca3af' }}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    );
    return <ChartEmptyState loading={loading} message={emptyMessage} icon={icon} />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="period" 
          tickFormatter={formatPeriodLabel}
          style={{ fontSize: '0.75rem' }}
          stroke="#6b7280"
        />
        <YAxis 
          tickFormatter={(value) => `$${value}`}
          style={{ fontSize: '0.75rem' }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '0.875rem' }}
          formatter={(value) => {
            if (value === 'expenses') return 'Expenses';
            if (value === 'netSavings') return 'Net Savings';
            return value;
          }}
        />
        <Bar dataKey="expenses" fill={SEMANTIC_COLORS.danger} radius={[4, 4, 0, 0]} />
        <Bar dataKey="netSavings" fill={SEMANTIC_COLORS.success} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
