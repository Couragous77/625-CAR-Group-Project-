import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listTransactions } from '../services/transactionService';
import { formatCurrency } from '../utils/currency';
import PiggyBank from '../components/PiggyBank';

function Profile() {
  const { user, getToken } = useAuth();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialSummary();

    // Refresh data every 10 seconds to catch new transactions
    const interval = setInterval(() => {
      loadFinancialSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function loadFinancialSummary() {
    try {
      const token = getToken();

      // Get current month's date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Fetch income
      const incomeData = await listTransactions({
        type: 'income',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 100,
      }, token);

      const incomeArray = Array.isArray(incomeData) ? incomeData : (incomeData.items || []);
      const incomeTotal = incomeArray.reduce((sum, t) => sum + t.amount_cents, 0);
      setTotalIncome(incomeTotal);

      // Fetch expenses
      const expenseData = await listTransactions({
        type: 'expense',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 100,
      }, token);

      const expenseArray = Array.isArray(expenseData) ? expenseData : (expenseData.items || []);
      const expenseTotal = expenseArray.reduce((sum, t) => sum + t.amount_cents, 0);
      setTotalExpenses(expenseTotal);
    } catch (error) {
      console.error('Failed to load financial summary:', error);
    } finally {
      setLoading(false);
    }
  }

  const currentSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? ((currentSavings / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="form-container" style={{ maxWidth: '900px' }}>
      <h1>Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* User Info */}
        <section className="panel">
          <h2>Account Information</h2>
          <div className="field">
            <label>Name</label>
            <p><strong>{user?.firstName} {user?.lastName}</strong></p>
          </div>
          <div className="field">
            <label>Email</label>
            <p><strong>{user?.email}</strong></p>
          </div>
          <div className="field">
            <label>Student Status</label>
            <p><strong>Undergraduate</strong></p>
          </div>
          <div className="divider"></div>
          <p className="muted">Profile editing functionality coming soon.</p>
        </section>

        {/* Savings Progress */}
        <section className="panel">
          <h2>Your Savings</h2>
          <PiggyBank
            currentSavings={loading ? 0 : currentSavings}
            savingsGoal={100000}
            compact={false}
          />
          {!loading && (
            <>
              <div className="divider" style={{ margin: '1.5rem 0' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>This Month's Income:</span>
                  <strong style={{ color: 'var(--success)' }}>{formatCurrency(totalIncome)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>This Month's Expenses:</span>
                  <strong style={{ color: 'var(--warn)' }}>{formatCurrency(totalExpenses)}</strong>
                </div>
                <div className="divider"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Savings Rate:</span>
                  <strong style={{ color: 'var(--accent)' }}>{savingsRate}%</strong>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
