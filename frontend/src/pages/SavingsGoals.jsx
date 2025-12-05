import { useEffect, useState } from "react";
import {
  getWeeklySavingsGoal,
  saveWeeklySavingsGoal,
  updateWeeklySavingsProgress,
} from "../services/savingsGoalService";
import SavingsProgressBar from "../components/goals/SavingsProgressBar";

export default function SavingsGoals() {
  const [goal, setGoal] = useState(getWeeklySavingsGoal());
  const [increment, setIncrement] = useState(0);

  function saveGoal() {
    const updated = saveWeeklySavingsGoal(goal);
    setGoal(updated);
  }

  function addProgress() {
    const updated = updateWeeklySavingsProgress(increment);
    setGoal(updated);
    setIncrement(0);
  }

  return (
    <div>
      <h1>Weekly Savings Goals</h1>

      <input
        type="text"
        placeholder="Week Label"
        value={goal.weekLabel}
        onChange={(e) => setGoal({ ...goal, weekLabel: e.target.value })}
      />

      <input
        type="number"
        placeholder="Target"
        value={goal.targetAmount}
        onChange={(e) => setGoal({ ...goal, targetAmount: Number(e.target.value) })}
      />

      <button onClick={saveGoal}>Save Goal</button>

      <h3>Add Progress</h3>

      <input
        type="number"
        value={increment}
        onChange={(e) => setIncrement(Number(e.target.value))}
      />
      <button onClick={addProgress}>Add</button>

      <SavingsProgressBar
        currentAmount={goal.currentAmount}
        targetAmount={goal.targetAmount}
      />
    </div>
  );
}
