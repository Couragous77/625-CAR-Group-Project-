import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listTransactions } from '../services/transactionService';
import { listCategories } from '../services/categoryService';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

function Dashboard() {
  const { getToken } = useAuth();
  const [recentIncome, setRecentIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);

  // Load categories and recent income on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load categories and recent income for current month
   */
  async function loadDashboardData() {
    try {
      setLoading(true);
      const token = getToken();

      // Load categories
      const cats = await listCategories(token);
      setCategories(cats);

      // Calculate current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Fetch income for current month
      const params = {
        type: 'income',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 5,
        sort_by: 'occurred_at',
        sort_order: 'desc',
      };

      const data = await listTransactions(params, token);
      setRecentIncome(data.items || []);

      // Calculate total income for current month
      const total = (data.items || []).reduce((sum, item) => sum + item.amount_cents, 0);
      setTotalIncome(total);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get category name by ID
   */
  function getCategoryName(categoryId) {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  return (
    <div className="wrap">
      {/* Left column (grid of cards) */}
      <section className="grid grid-cols-2" aria-label="Dashboard overview">
        {/* Balances + donut */}
        <article className="card" aria-labelledby="balances-title">
          <h2 id="balances-title">My Balances</h2>
          <p className="muted">Expense breakdown will be displayed here.</p>
        </article>

        {/* Weekly goal + piggy */}
        <article className="card" aria-labelledby="weekly-title">
          <h2 id="weekly-title">Weekly Goal</h2>
          <div className="progress" aria-hidden="true">
            <span style={{ width: '72%' }}></span>
          </div>
          <div className="divider"></div>
          <div>
            <strong>Savings progress</strong>
            <p className="muted" style={{ margin: '0.55rem 0 0' }}>Keep going — you're close to your goal.</p>
          </div>
        </article>

        {/* Add Expense */}
        <article className="card" aria-labelledby="add-title">
          <h2 id="add-title">Add Expense</h2>
          <form autoComplete="on" onSubmit={(e) => {
            e.preventDefault();
            alert('Expense functionality coming soon!');
          }}>
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                placeholder="e.g., 12.99"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required>
                <option value="" disabled>Select category</option>
                <option>Textbooks</option>
                <option>Tuition</option>
                <option>Rent</option>
                <option>Food</option>
                <option>Entertainment</option>
                <option>Transportation</option>
                <option>Misc</option>
              </select>
            </div>
            <button className="btn primary" type="submit">
              Add
            </button>
          </form>
        </article>

        {/* Recent Transactions */}
        <article className="card" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent Transactions</h2>
          <div role="region" aria-label="Recent transactions">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-09-10</td>
                  <td>Meal Plan Top-Up</td>
                  <td>Food</td>
                  <td style={{ textAlign: 'right', color: 'var(--warn)' }}>-$35.25</td>
                </tr>
                <tr>
                  <td>2025-09-09</td>
                  <td>Textbook – Algorithms</td>
                  <td>Textbooks</td>
                  <td style={{ textAlign: 'right', color: 'var(--warn)' }}>-$72.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Right column (Income + Categories) */}
      <aside className="kpi" aria-label="Income and categories">
        <section className="panel" aria-labelledby="income-title">
          <h2 id="income-title">Income (This Month)</h2>

          {loading ? (
            <p className="muted">Loading income...</p>
          ) : recentIncome.length === 0 ? (
            <p className="muted">No income recorded this month.</p>
          ) : (
            <>
              <ul className="list">
                {recentIncome.map((income) => (
                  <li key={income.id}>
                    <span>
                      {getCategoryName(income.category_id)}
                      <br />
                      <small className="muted">{formatDate(income.occurred_at)}</small>
                    </span>
                    <strong style={{ color: 'var(--success)' }}>
                      {formatCurrency(income.amount_cents)}
                    </strong>
                  </li>
                ))}
              </ul>

              <div className="divider" style={{ margin: '1rem 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Total Income:</strong>
                <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <Link
                to="/track-income"
                className="btn primary"
                style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
              >
                View All Income
              </Link>
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="cats-title">
          <h2 id="cats-title">Expense Categories</h2>
          <ul className="list">
            <li>
              <span>Textbooks</span>
            </li>
            <li>
              <span>Rent</span>
            </li>
            <li>
              <span>Food</span>
            </li>
            <li>
              <span>Entertainment</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

export default Dashboard;
