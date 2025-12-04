export default function SavingsProgressBar({ currentAmount, targetAmount }) {
  const pct = Math.min(100, (currentAmount / (targetAmount || 1)) * 100);

  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      <p>{pct.toFixed(0)}% of target</p>
    </div>
  );
}
