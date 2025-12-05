import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listTransactions, createTransaction } from '../services/transactionService';
import { listCategories } from '../services/categoryService';
import { getSpendingByCategory, getTrendsByPeriod } from '../services/aggregationService';
import { listGoals, createGoal } from '../services/goalService';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatDateShort } from '../utils/date';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import TrendsBarChart from '../components/charts/TrendsBarChart';
import DashboardFilters from '../components/DashboardFilters';
import PiggyBank from '../components/PiggyBank';
import { useToast } from "../context/ToastContext";
import { calculateLowFunds } from "../services/notificationService";
import SavingsProgressBar from "../components/goals/SavingsProgressBar";
import { getWeeklySavingsGoal } from "../services/savingsGoalService";


function Dashboard() {
  const { showToast } = useToast();
  const weeklyGoal = getWeeklySavingsGoal();
  const { getToken } = useAuth();
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenseEnvelopes, setExpenseEnvelopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Quick add expense form state
  const [quickExpense, setQuickExpense] = useState({
    amount: '',
    category_id: '',
    description: '',
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    target_date: '',
  });
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Analytics data
  const [spendingData, setSpendingData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: '',
    endDate: '',
    categories: [],
  });

  // Load categories and recent income on mount
  useEffect(() => {
    loadDashboardData();
    loadGoals();
  }, []);

  // Load analytics data when filters change
  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);
  useEffect(() => {
    async function checkLowFunds() {
      try {
        const result = await calculateLowFunds();

        if (result.count > 0) {
          result.envelopes.forEach(env => {
            showToast(
              `Low Funds: ${env.name} — ${env.reason}`,
              "warning"
            );
          });
        }
      } catch (err) {
        console.error("Low funds alert failed:", err);
      }
    }

    checkLowFunds();
  }, []);

  /**
   * Load categories and recent income for current month
   */
  async function loadDashboardData() {
    try {
      setLoading(true);
      const token = getToken();

      // Load all categories
      const cats = await listCategories(token);
      setCategories(cats);

      // Calculate current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Fetch income for current month
      const incomeParams = {
        type: 'income',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 5,
        sort_by: 'occurred_at',
        sort_order: 'desc',
      };

      const incomeData = await listTransactions(incomeParams, token);
      const incomeList = Array.isArray(incomeData) ? incomeData : (incomeData.items || []);
      setRecentIncome(incomeList);

      // Calculate total income for current month
      const totalInc = incomeList.reduce((sum, item) => sum + item.amount_cents, 0);
      setTotalIncome(totalInc);

      // Fetch expenses for current month to calculate envelope spending
      const expenseParams = {
        type: 'expense',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 100, // Backend maximum per page
      };

      const expenseData = await listTransactions(expenseParams, token);

      let expenses = Array.isArray(expenseData) ? expenseData : (expenseData.items || []);

      // Calculate total expenses for the month
      const totalExp = expenses.reduce((sum, exp) => sum + exp.amount_cents, 0);
      setTotalExpenses(totalExp);

      // Calculate spending per category for expense envelopes
      const expenseCats = cats.filter(cat => cat.type === 'expense' && cat.monthly_limit_cents);

      const envelopesWithSpending = expenseCats.map(cat => {
        const categoryExpenses = expenses.filter(exp => exp.category_id === cat.id);
        const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount_cents, 0);

        const limit = cat.monthly_limit_cents || 0;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const remaining = limit - spent;

        return {
          ...cat,
          spent,
          limit,
          remaining,
          percentage: Math.min(percentage, 100), // Cap at 100%
          isOverBudget: spent > limit,
          isNearLimit: percentage >= 80 && percentage < 100,
        };
      });

      setExpenseEnvelopes(envelopesWithSpending);

      // Fetch recent transactions (all types, most recent 5)
      const recentParams = {
        page: 1,
        limit: 5,
        sort_by: 'occurred_at',
        sort_order: 'desc',
      };

      const recentData = await listTransactions(recentParams, token);
      const recentList = Array.isArray(recentData) ? recentData : (recentData.items || []);
      setRecentTransactions(recentList);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);

      // Handle validation errors specifically
      if (error.status === 422 && error.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          const messages = error.data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          console.error('Validation errors:', messages);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load analytics data (charts) based on current filters
   */
  async function loadAnalyticsData() {
    try {
      setChartsLoading(true);
      const token = getToken();

      if (!token) {
        console.error('No authentication token available');
        return;
      }

      // Build params from filters
      const params = {
        period: filters.period,
      };

      if (filters.startDate) {
        params.startDate = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        params.endDate = new Date(filters.endDate).toISOString();
      }

      // Add category filter if categories are selected
      if (filters.categories && filters.categories.length > 0) {
        params.categoryIds = filters.categories;
      }

      // Load spending by category (expenses only)
      const spendingResult = await getSpendingByCategory({
        ...params,
        type: 'expense',
      }, token);
      setSpendingData(spendingResult.aggregates || []);

      // Load trends data (both income and expenses for net savings calculation)
      const trendsResult = await getTrendsByPeriod(params, token);
      setTrendsData(trendsResult.aggregates || []);

    } catch (error) {
      console.error('Failed to load analytics data:', error.message || error);
      console.error('Full error:', error);
    } finally {
      setChartsLoading(false);
    }
  }

  /**
   * Handle filter changes from DashboardFilters component
   */
  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
  }

  /**
   * Load goals for current user
   */
  async function loadGoals() {
    try {
      setLoadingGoals(true);
      const token = getToken();
      if (!token) return;
      const goalData = await listGoals(token);
      setGoals(Array.isArray(goalData) ? goalData : []);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoadingGoals(false);
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

  /**
   * Handle quick expense form submission
   */
  async function handleQuickExpenseSubmit(e) {
    e.preventDefault();

    if (!quickExpense.amount || !quickExpense.category_id) {
      alert('Please fill in amount and category');
      return;
    }

    try {
      setSubmittingExpense(true);
      const token = getToken();

      const expenseData = {
        type: 'expense',
        amount_cents: Math.round(parseFloat(quickExpense.amount) * 100),
        category_id: quickExpense.category_id,
        description: quickExpense.description || '',
        occurred_at: new Date().toISOString(),
      };

      await createTransaction(expenseData, token);

      // Reset form
      setQuickExpense({
        amount: '',
        category_id: '',
        description: '',
      });

      // Refresh dashboard data
      await loadDashboardData();
      await loadAnalyticsData();

    } catch (error) {
      console.error('Failed to add expense:', error);
      alert(error.message || 'Failed to add expense. Please try again.');
    } finally {
      setSubmittingExpense(false);
    }
  }

  /**
   * Handle create goal form submission
   */
  async function handleCreateGoalSubmit(e) {
    e.preventDefault();

    if (!goalForm.name || !goalForm.target) {
      alert('Please enter a goal name and target amount');
      return;
    }

    const targetNumber = Number.parseFloat(goalForm.target);
    if (Number.isNaN(targetNumber) || targetNumber <= 0) {
      alert('Target amount must be greater than 0');
      return;
    }

    try {
      setSubmittingGoal(true);
      const token = getToken();
      const payload = {
        name: goalForm.name.trim(),
        target_cents: Math.round(targetNumber * 100),
        target_date: goalForm.target_date ? new Date(goalForm.target_date).toISOString() : null,
      };

      await createGoal(payload, token);

      setGoalForm({
        name: '',
        target: '',
        target_date: '',
      });

      await loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert(error.message || 'Failed to create goal. Please try again.');
    } finally {
      setSubmittingGoal(false);
    }
  }

  return (
    <div className="wrap" style={{ gridTemplateColumns: '1fr' }}>
      {/* Main 3x2 Grid */}
      <section className="grid grid-cols-3" aria-label="Dashboard overview">
        {/* Row 1: Monthly Summary, Income, Budget Envelopes */}
        
        {/* Monthly Financial Summary */}
        <article className="card" aria-labelledby="balances-title">
          <h2 id="balances-title">Monthly Financial Summary</h2>
          {loading ? (
            <p className="muted">Loading summary...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Income */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Income</span>
                <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div className="divider"></div>

              {/* Expenses */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Expenses</span>
                <strong style={{ color: 'var(--warn)', fontSize: '1.1rem' }}>
                  {formatCurrency(totalExpenses)}
                </strong>
              </div>

              <div className="divider"></div>

              {/* Net Savings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Net Savings</strong>
                <strong style={{
                  color: totalIncome - totalExpenses >= 0 ? 'var(--success)' : 'var(--danger)',
                  fontSize: '1.3rem'
                }}>
                  {totalIncome - totalExpenses >= 0 ? '+' : ''}
                  {formatCurrency(totalIncome - totalExpenses)}
                </strong>
              </div>

              {/* Savings Rate */}
              {totalIncome > 0 && (
                <>
                  <div className="divider"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="muted">Savings Rate</span>
                    <span className="muted">
                      {Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </article>

        {/* Income (This Month) */}
        <article className="card" aria-labelledby="income-title">
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
                      <small className="muted">{formatDateShort(income.occurred_at)}</small>
                    </span>
                    <strong style={{ color: 'var(--success)', whiteSpace: 'nowrap' }}>
                      {formatCurrency(income.amount_cents)}
                    </strong>
                  </li>
                ))}
              </ul>

              <div className="divider" style={{ margin: '0.75rem 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Total:</strong>
                <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <Link
                to="/track-income"
                className="btn primary"
                style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}
              >
                View All Income
              </Link>
            </>
          )}
        </article>

        {/* Budget Envelopes */}
        <article className="card" aria-labelledby="cats-title">
          <h2 id="cats-title">Budget Envelopes</h2>
          {loading ? (
            <p className="muted">Loading envelopes...</p>
          ) : expenseEnvelopes.length === 0 ? (
            <div>
              <p className="muted">No budget envelopes set up yet.</p>
              <Link to="/envelopes" className="btn primary" style={{ marginTop: '1rem', width: '100%' }}>
                Create Envelopes
              </Link>
            </div>
          ) : (
            <>
              <ul className="list" style={{ gap: '0.75rem' }}>
                {expenseEnvelopes.map((envelope) => (
                  <li key={envelope.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{envelope.name}</strong>
                      <span className="muted" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {formatCurrency(envelope.spent)} / {formatCurrency(envelope.limit)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div 
                      role="progressbar"
                      aria-valuenow={Math.round(envelope.percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${envelope.name} budget: ${Math.round(envelope.percentage)}% used`}
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        width: `${envelope.percentage}%`,
                        height: '100%',
                        backgroundColor: envelope.isOverBudget
                          ? 'var(--danger, #ef4444)'
                          : envelope.isNearLimit
                          ? 'var(--warn, #f59e0b)'
                          : 'var(--success, #10b981)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{
                        color: envelope.isOverBudget ? 'var(--danger)' : envelope.remaining > 0 ? 'var(--success)' : 'var(--muted)'
                      }}>
                        {envelope.isOverBudget ? 'Over budget' : `${formatCurrency(envelope.remaining)} left`}
                      </span>
                      <span className="muted">{Math.round(envelope.percentage)}%</span>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                to="/envelopes"
                className="btn secondary"
                style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}
              >
                Manage Envelopes
              </Link>
            </>
          )}
        </article>
       
        {/* Weekly Savings Goal Progress */}
        <article className="card" aria-labelledby="weekly-savings-progress-title">
          <h2 id="weekly-savings-progress-title">Weekly Savings Progress</h2>

          <SavingsProgressBar
            currentAmount={weeklyGoal.currentAmount}
            targetAmount={weeklyGoal.targetAmount}
          />

          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Week: {weeklyGoal.weekLabel || "Not set"}
          </p>
        </article>

        {/* Row 2: Savings Progress, Quick Add Expense, Recent Transactions */}

        {/* Goals */}
        <article className="card" aria-labelledby="goals-title">
          <h2 id="goals-title">Savings Goals</h2>
          {loadingGoals ? (
            <p className="muted">Loading goals...</p>
          ) : goals.length === 0 ? (
            <p className="muted">No goals yet. Create your first goal below.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {goals.map((goal) => {
                const currentSavings = Math.max(0, totalIncome - totalExpenses);
                return (
                  <div key={goal.id} style={{ 
                    padding: '1rem', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)'
                  }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{goal.name}</h3>
                    {goal.target_date && (
                      <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        Target: {formatDate(goal.target_date)}
                      </p>
                    )}
                    <PiggyBank 
                      currentSavings={currentSavings}
                      savingsGoal={goal.target_cents}
                      compact={true}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="divider" style={{ margin: '0.75rem 0' }}></div>

          <form onSubmit={handleCreateGoalSubmit}>
            <div className="field">
              <label htmlFor="goal-name">Goal name</label>
              <input
                id="goal-name"
                name="name"
                type="text"
                placeholder="e.g., Emergency fund"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                disabled={submittingGoal}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="goal-target">Target amount ($)</label>
              <input
                id="goal-target"
                name="target"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="e.g., 500"
                value={goalForm.target}
                onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                disabled={submittingGoal}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="goal-date">Target date (optional)</label>
              <input
                id="goal-date"
                name="target_date"
                type="date"
                value={goalForm.target_date}
                onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                disabled={submittingGoal}
              />
            </div>
            <button className="btn primary" type="submit" disabled={submittingGoal}>
              {submittingGoal ? 'Saving...' : 'Create Goal'}
            </button>
          </form>
        </article>

        {/* Add Expense */}
        <article className="card" aria-labelledby="add-title">
          <h2 id="add-title">Quick Add Expense</h2>
          <form autoComplete="on" onSubmit={handleQuickExpenseSubmit}>
            <div className="field">
              <label htmlFor="quick-amount">Amount ($)</label>
              <input
                id="quick-amount"
                name="amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="e.g., 12.99"
                value={quickExpense.amount}
                onChange={(e) => setQuickExpense({...quickExpense, amount: e.target.value})}
                required
                disabled={submittingExpense}
              />
            </div>
            <div className="field">
              <label htmlFor="quick-category">Category</label>
              <select
                id="quick-category"
                name="category"
                value={quickExpense.category_id}
                onChange={(e) => setQuickExpense({...quickExpense, category_id: e.target.value})}
                required
                disabled={submittingExpense}
              >
                <option value="">Select category</option>
                {categories
                  .filter(cat => cat.type === 'expense')
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="quick-description">Description (optional)</label>
              <input
                id="quick-description"
                name="description"
                type="text"
                placeholder="e.g., Coffee at Starbucks"
                value={quickExpense.description}
                onChange={(e) => setQuickExpense({...quickExpense, description: e.target.value})}
                disabled={submittingExpense}
              />
            </div>
            <button 
              className="btn primary" 
              type="submit" 
              disabled={submittingExpense}
              aria-disabled={submittingExpense}
              aria-label={submittingExpense ? 'Adding expense' : 'Add expense'}
            >
              {submittingExpense ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </article>

        {/* Recent Transactions */}
        <article className="card" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent Transactions</h2>
          <div role="region" aria-label="Recent transactions">
            {loading ? (
              <p className="muted">Loading transactions...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="muted">No transactions yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Date</th>
                    <th>Description</th>
                    <th style={{ width: '120px' }}>Category</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateShort(transaction.occurred_at)}</td>
                      <td style={{ 
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {transaction.description || 'No description'}
                      </td>
                      <td>{getCategoryName(transaction.category_id)}</td>
                      <td style={{
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: transaction.type === 'expense' ? 'var(--warn)' : 'var(--success)'
                      }}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(transaction.amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </section>

      {/* Analytics/Insights Section */}
      <section
        style={{
          gridColumn: '1 / -1',
          marginTop: '2rem',
        }}
        aria-label="Budget analytics and insights"
      >
        <h2 style={{ marginBottom: '1rem' }}>Budget Insights</h2>

        {/* Filters */}
        <DashboardFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {/* Spending Breakdown Pie Chart */}
          <article className="card" aria-labelledby="spending-chart-title">
            <h3 id="spending-chart-title" style={{ marginBottom: '1rem' }}>
              Spending by Category
            </h3>
            <SpendingPieChart
              data={spendingData}
              loading={chartsLoading}
              emptyMessage="No spending data for selected period"
            />
          </article>

          {/* Trends Bar Chart */}
          <article className="card" aria-labelledby="trends-chart-title">
            <h3 id="trends-chart-title" style={{ marginBottom: '1rem' }}>
              Spending & Savings Trends
            </h3>
            <TrendsBarChart
              data={trendsData}
              period={filters.period}
              loading={chartsLoading}
              emptyMessage="No trend data for selected period"
            />
          </article>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
