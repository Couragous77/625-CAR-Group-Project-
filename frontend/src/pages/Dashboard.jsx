import { useState, useEffect, useRef } from 'react';
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
import SavingsProgressBar from "../components/goals/SavingsProgressBar";
import {
  getWeeklySavingsGoal,
  saveWeeklySavingsGoal,
  updateWeeklySavingsProgress,
} from "../services/savingsGoalService";
import { useNotifications } from "../context/NotificationContext";

function Dashboard() {
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  // For envelope change tracking (both low-funds + over-budget)
  const prevEnvelopesRef = useRef(null);
  // Gate so alerts only start after user has actually added an expense
  const alertsEnabledRef = useRef(false);

  const [weeklyGoal, setWeeklyGoal] = useState(() => getWeeklySavingsGoal());

  const [weeklyGoalForm, setWeeklyGoalForm] = useState({
    targetAmount: weeklyGoal.targetAmount || "",
    weekLabel: weeklyGoal.weekLabel || "",
  });
  const [weeklySavingsInput, setWeeklySavingsInput] = useState("");

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

  /**
   * Envelope alerts (single combined effect)
   * - Toast: low funds (0–10% remaining, NOT over budget)
   * - Bell: crosses from not-over to over-budget
   */
  useEffect(() => {
    if (!expenseEnvelopes || expenseEnvelopes.length === 0) {
      prevEnvelopesRef.current = null;
      return;
    }

    const threshold = 0.10; // 10% remaining
    const prev = prevEnvelopesRef.current;

    // Snapshot current envelopes for next run
    const snapshot = expenseEnvelopes.map((env) => ({
      id: env.id,
      remaining: env.remaining,
      limit: env.limit,
      isOverBudget: env.isOverBudget,
    }));

    // Before alerts are enabled, just store baseline and exit
    if (!alertsEnabledRef.current) {
      prevEnvelopesRef.current = snapshot;
      return;
    }

    expenseEnvelopes.forEach((env) => {
      if (!env.limit || env.limit <= 0) return;

      const prevEnv = prev?.find((p) => p.id === env.id);
      const prevRemaining = prevEnv?.remaining;
      const wasOver = prevEnv?.isOverBudget ?? false;
      const isOver = env.isOverBudget;

      const remainingRatio = env.remaining / env.limit;

      // 1) LOW FUNDS TOAST (only when NOT over budget)
      // - Only when remaining is between 0 and 10% of limit
      // - Fires when:
      //    • envelope is low and remaining changed, OR
      //    • envelope just became low
      if (!isOver) {
        if (remainingRatio > 0 && remainingRatio <= threshold) {
          const remainingChanged =
            prevEnv === undefined || prevRemaining !== env.remaining;

          if (remainingChanged) {
            const percent = Math.round(remainingRatio * 100);
            showToast(
              `Low funds in ${env.name}: ${formatCurrency(env.remaining)} left (${percent}% of ${formatCurrency(env.limit)})`,
              "warning"
            );
          }
        }
      }

      // 2) OVER-BUDGET BELL (only when crossing into over-budget)
      // - Fires when was NOT over budget in prev snapshot and IS over budget now
      if (!wasOver && isOver) {
        addNotification({
          type: "warning",
          title: "Over budget",
          message: `${env.name} is over its monthly limit.`,
        });
      }
    });

    // Save snapshot for next comparison
    prevEnvelopesRef.current = snapshot;
  }, [expenseEnvelopes, showToast, addNotification]);

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

      // Current month range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Income (this month)
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

      const totalInc = incomeList.reduce((sum, item) => sum + item.amount_cents, 0);
      setTotalIncome(totalInc);

      // Expenses for envelopes
      const expenseParams = {
        type: 'expense',
        start_date: firstDay.toISOString(),
        end_date: lastDay.toISOString(),
        page: 1,
        limit: 100,
      };

      const expenseData = await listTransactions(expenseParams, token);
      const expenses = Array.isArray(expenseData) ? expenseData : (expenseData.items || []);

      const totalExp = expenses.reduce((sum, exp) => sum + exp.amount_cents, 0);
      setTotalExpenses(totalExp);

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
          percentage: Math.min(percentage, 100),
          isOverBudget: spent > limit,
          isNearLimit: percentage >= 80 && percentage < 100,
        };
      });

      setExpenseEnvelopes(envelopesWithSpending);

      // Recent transactions (all types)
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
    } finally {
      setLoading(false);
    }
  }

  function handleWeeklyGoalSubmit(e) {
    e.preventDefault();

    const target = Number(weeklyGoalForm.targetAmount);
    if (Number.isNaN(target) || target <= 0) {
      showToast("Please enter a valid weekly target greater than 0.", "error");
      return;
    }

    const updated = saveWeeklySavingsGoal({
      targetAmount: target,
      currentAmount: weeklyGoal.currentAmount || 0,
      weekLabel: weeklyGoalForm.weekLabel.trim() || "This week",
    });

    setWeeklyGoal(updated);
    showToast("Weekly savings goal saved.", "success");
  }

  function handleAddWeeklySavings(e) {
    e.preventDefault();

    const delta = Number(weeklySavingsInput);
    if (Number.isNaN(delta) || delta <= 0) {
      showToast("Enter an amount greater than 0 to add to this week.", "error");
      return;
    }

    const updated = updateWeeklySavingsProgress(delta);
    setWeeklyGoal(updated);
    setWeeklySavingsInput("");
    showToast(`Added $${delta.toFixed(2)} to this week's savings.`, "success");
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

      const params = {
        period: filters.period,
      };

      if (filters.startDate) {
        params.startDate = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        params.endDate = new Date(filters.endDate).toISOString();
      }

      if (filters.categories && filters.categories.length > 0) {
        params.categoryIds = filters.categories;
      }

      const spendingResult = await getSpendingByCategory({
        ...params,
        type: 'expense',
      }, token);
      setSpendingData(spendingResult.aggregates || []);

      const trendsResult = await getTrendsByPeriod(params, token);
      setTrendsData(trendsResult.aggregates || []);

    } catch (error) {
      console.error('Failed to load analytics data:', error.message || error);
      console.error('Full error:', error);
    } finally {
      setChartsLoading(false);
    }
  }

  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
  }

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

  function getCategoryName(categoryId) {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

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

      // Update weekly goal progress (spending reduces savings)
      const updatedGoal = updateWeeklySavingsProgress(-expenseData.amount_cents / 100);
      setWeeklyGoal(updatedGoal);

      setQuickExpense({
        amount: '',
        category_id: '',
        description: '',
      });

      // ✅ From now on, enable low-funds + over-budget alerts for THIS session
      alertsEnabledRef.current = true;

      await loadDashboardData();
      await loadAnalyticsData();

    } catch (error) {
      console.error('Failed to add expense:', error);
      alert(error.message || 'Failed to add expense. Please try again.');
    } finally {
      setSubmittingExpense(false);
    }
  }

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
        {/* Monthly Financial Summary */}
        <article className="card" aria-labelledby="balances-title">
          <h2 id="balances-title">Monthly Financial Summary</h2>
          {loading ? (
            <p className="muted">Loading summary...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Income</span>
                <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>
                  {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div className="divider"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Expenses</span>
                <strong style={{ color: 'var(--warn)', fontSize: '1.1rem' }}>
                  {formatCurrency(totalExpenses)}
                </strong>
              </div>

              <div className="divider"></div>

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
                  <li
                    key={envelope.id}
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <strong style={{ fontSize: '0.9rem' }}>{envelope.name}</strong>
                      <span className="muted" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {formatCurrency(envelope.spent)} / {formatCurrency(envelope.limit)}
                      </span>
                    </div>

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
                      <div
                        style={{
                          width: `${envelope.percentage}%`,
                          height: '100%',
                          backgroundColor: envelope.isOverBudget
                            ? 'var(--danger, #ef4444)'
                            : envelope.isNearLimit
                            ? 'var(--warn, #f59e0b)'
                            : 'var(--success, #10b981)',
                          transition: 'width 0.3s ease'
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{
                        color: envelope.isOverBudget
                          ? 'var(--danger)'
                          : envelope.remaining > 0
                          ? 'var(--success)'
                          : 'var(--muted)'
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
          <div className="divider" style={{ margin: "1rem 0" }}></div>

          <h3 style={{ marginBottom: "0.5rem" }}>Set Weekly Goal</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newGoal = {
                targetAmount: Number(e.target.targetAmount.value),
                currentAmount: 0,
                weekLabel: e.target.weekLabel.value || "",
              };
              saveWeeklySavingsGoal(newGoal);
              showToast("Weekly savings goal updated!", "success");
              window.location.reload();
            }}
          >
            <div className="field">
              <label>Target Amount ($)</label>
              <input
                type="number"
                name="targetAmount"
                step="0.01"
                required
                placeholder="e.g., 100"
              />
            </div>

            <div className="field">
              <label>Week Label</label>
              <input
                type="text"
                name="weekLabel"
                placeholder="e.g., Week of Dec 1–7"
              />
            </div>

            <button className="btn primary" type="submit">
              Save Weekly Goal
            </button>
          </form>
        </article>

        {/* Savings Goals */}
        <article className="card" aria-labelledby="goals-title">
          <h2 id="goals-title">Savings Goals</h2>
          {loadingGoals ? (
            <p className="muted">Loading goals...</p>
          ) : goals.length === 0 ? (
            <p className="muted">No goals yet. Create your first goal below.</p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {goals.map((goal) => {
                const currentSavings = Math.max(0, totalIncome - totalExpenses);
                return (
                  <div
                    key={goal.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  >
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
                onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
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
                onChange={(e) => setQuickExpense({ ...quickExpense, category_id: e.target.value })}
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
                onChange={(e) => setQuickExpense({ ...quickExpense, description: e.target.value })}
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

        <DashboardFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />

        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
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
