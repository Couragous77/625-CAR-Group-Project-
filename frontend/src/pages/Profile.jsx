import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PiggyBank from '../components/PiggyBank';
import { formatCurrency } from '../utils/currency';

function Profile() {
  const { user, getToken, saveProfile, loading: authLoading } = useAuth();

  // Profile form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    studentStatus: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Financial summary state
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        studentStatus: user.studentStatus || '',
      });
    }
  }, [user]);

  // Load financial summary
  useEffect(() => {
    loadFinancialSummary();
    const interval = setInterval(loadFinancialSummary, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadFinancialSummary() {
    try {
      const token = getToken();

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const incomeData = await listTransactions(
        {
          type: 'income',
          start_date: firstDay.toISOString(),
          end_date: lastDay.toISOString(),
          page: 1,
          limit: 100,
        },
        token
      );

      const incomeArray = Array.isArray(incomeData)
        ? incomeData
        : incomeData.items || [];
      setTotalIncome(incomeArray.reduce((sum, t) => sum + t.amount_cents, 0));

      const expenseData = await listTransactions(
        {
          type: 'expense',
          start_date: firstDay.toISOString(),
          end_date: lastDay.toISOString(),
          page: 1,
          limit: 100,
        },
        token
      );

      const expenseArray = Array.isArray(expenseData)
        ? expenseData
        : expenseData.items || [];
      setTotalExpenses(expenseArray.reduce((sum, t) => sum + t.amount_cents, 0));
    } catch (err) {
      console.error('Failed to load financial summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }

  const currentSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate =
    totalIncome > 0
      ? ((currentSavings / totalIncome) * 100).toFixed(1)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await saveProfile({
        first_name: form.firstName,
        last_name: form.lastName,
        student_status: form.studentStatus,
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="form-container" style={{ maxWidth: '900px' }}>
      <h1>Profile</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        {/* LEFT PANEL — EDIT PROFILE */}
        <section className="panel">
          <h2>Edit Profile</h2>

          {authLoading ? (
            <p className="muted">Loading profile...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    handleChange('firstName', e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    handleChange('lastName', e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input value={user?.email} readOnly disabled />
              </div>

              <div className="field">
                <label>Student Status</label>
                <select
                  value={form.studentStatus}
                  onChange={(e) =>
                    handleChange('studentStatus', e.target.value)
                  }
                >
                  <option value="">Select status</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="part-time">Part-time</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button className="btn primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>

              {message && (
                <p className="success">{message}</p>
              )}
              {error && <p className="danger">{error}</p>}
            </form>
          )}
        </section>

        {/* RIGHT PANEL — FINANCIAL SUMMARY */}
        <section className="panel">
          <h2>Your Savings</h2>

          <PiggyBank
            currentSavings={summaryLoading ? 0 : currentSavings}
            savingsGoal={100000}
            compact={false}
          />

          {!summaryLoading && (
            <>
              <div className="divider"></div>

              <div className="field-row">
                <span>This Month's Income:</span>
                <strong style={{ color: 'var(--success)' }}>
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div className="field-row">
                <span>This Month's Expenses:</span>
                <strong style={{ color: 'var(--warn)' }}>
                  {formatCurrency(totalExpenses)}
                </strong>
              </div>

              <div className="divider"></div>

              <div className="field-row">
                <span>Savings Rate:</span>
                <strong style={{ color: 'var(--accent)' }}>
                  {savingsRate}%
                </strong>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
