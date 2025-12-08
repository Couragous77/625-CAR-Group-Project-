import React from "react";

export default function SavingsProgressBar({ currentAmount = 0, targetAmount = 0 }) {
  const current = Number(currentAmount);
  const target = Number(targetAmount);

  // Avoid division by zero
  const rawPercent = target > 0 ? (current / target) * 100 : 0;

  // Text label percent (0–100 only)
  const clampedPercent = Math.max(0, Math.min(rawPercent, 100));
  const roundedPercent = Math.round(clampedPercent);

  // Visual bar percent — always show at least 5% if negative
  const barPercent = rawPercent <= 0 ? 5 : clampedPercent;

  // Color zones (match envelope logic)
  let barColor = "var(--success)"; // green
  if (rawPercent < 25) barColor = "var(--danger)"; // red
  else if (rawPercent < 60) barColor = "var(--warn)"; // yellow

  return (
    <div style={{ width: "100%" }}>
      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "12px",
          backgroundColor: "#e5e7eb",
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            width: `${barPercent}%`,
            height: "100%",
            backgroundColor: barColor,
            transition: "width 0.35s ease",
          }}
        />
      </div>

      {/* Numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span>
          ${current.toFixed(2)} of ${target.toFixed(2)}
        </span>
        <span>{roundedPercent}%</span>
      </div>
    </div>
  );
}

