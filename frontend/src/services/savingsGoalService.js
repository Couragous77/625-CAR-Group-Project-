const KEY = "budgetcar_weekly_savings_goal";

export function getWeeklySavingsGoal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { targetAmount: 0, currentAmount: 0, weekLabel: "" };
  } catch {
    return { targetAmount: 0, currentAmount: 0, weekLabel: "" };
  }
}

export function saveWeeklySavingsGoal(goal) {
  localStorage.setItem(KEY, JSON.stringify(goal));
  return goal;
}

export function updateWeeklySavingsProgress(delta) {
  const goal = getWeeklySavingsGoal();
  goal.currentAmount += Number(delta);
  saveWeeklySavingsGoal(goal);
  return goal;
}
