import { useState, useEffect } from 'react';
import { listCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardFilters - Filter controls for charts
 * 
 * @param {Object} props
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {Object} props.initialFilters - Initial filter values
 */
export default function DashboardFilters({ onFiltersChange, initialFilters = {} }) {
  const { getToken } = useAuth();
  
  const [period, setPeriod] = useState(initialFilters.period || 'monthly');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
  const [categories, setCategories] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const token = getToken();
      const cats = await listCategories(token);
      // Only show expense categories since the spending chart filters by expense type
      const expenseCategories = cats.filter(cat => cat.type === 'expense');
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  // Notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        period,
        startDate,
        endDate,
        categories: selectedCategories,
      });
    }
  }, [period, startDate, endDate, selectedCategories]);

  // Handle category toggle
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Quick date range presets
  const setQuickRange = (range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last-3-months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = now;
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Clear all filters
  const clearFilters = () => {
    setPeriod('monthly');
    setStartDate('');
    setEndDate('');
    setSelectedCategories([]);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'flex-end',
      }}>
        {/* Period selector */}
        <div className="field" style={{ flex: '0 0 auto', minWidth: '120px', marginBottom: 0 }}>
          <label htmlFor="period-select" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Period
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Start date */}
        <div className="field" style={{ flex: '0 0 auto', minWidth: '140px', marginBottom: 0 }}>
          <label htmlFor="start-date" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* End date */}
        <div className="field" style={{ flex: '0 0 auto', minWidth: '140px', marginBottom: 0 }}>
          <label htmlFor="end-date" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Quick ranges */}
        <div style={{ flex: '0 0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            onClick={() => setQuickRange('this-month')}
          >
            This Month
          </button>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            onClick={() => setQuickRange('last-3-months')}
          >
            Last 3 Months
          </button>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            onClick={() => setQuickRange('this-year')}
          >
            This Year
          </button>
        </div>

        {/* Category filter toggle */}
        <button
          type="button"
          className="btn secondary"
          style={{ fontSize: '0.875rem', marginLeft: 'auto' }}
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
        >
          {showCategoryFilter ? 'Hide' : 'Show'} Categories
          {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
        </button>

        {/* Clear filters */}
        <button
          type="button"
          className="btn secondary"
          style={{ fontSize: '0.875rem' }}
          onClick={clearFilters}
        >
          Clear All
        </button>
      </div>

      {/* Category checkboxes */}
      {showCategoryFilter && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Filter by Categories:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}>
            {categories.map(category => (
              <label
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{category.name}</span>
                <span 
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    backgroundColor: category.type === 'income' ? '#d1fae5' : '#fee2e2',
                    color: category.type === 'income' ? '#065f46' : '#991b1b',
                  }}
                >
                  {category.type}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
