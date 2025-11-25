import { useState, useEffect, useRef } from 'react';
import '../styles/piggyBank.css';

/**
 * PiggyBank - Animated SVG piggy bank component showing savings progress
 *
 * @param {Object} props
 * @param {number} props.currentSavings - Current savings amount in cents
 * @param {number} props.savingsGoal - Savings goal in cents (default: 100000 = $1000)
 * @param {boolean} props.compact - Compact mode for smaller displays
 */
export default function PiggyBank({ currentSavings = 0, savingsGoal = 100000, compact = false }) {
  const [percentage, setPercentage] = useState(0);
  const [fillLevel, setFillLevel] = useState('empty'); // empty, low, medium, high, full
  const [isShaking, setIsShaking] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [idleShake, setIdleShake] = useState(false);
  const prevSavingsRef = useRef(0);
  const idleTimerRef = useRef(null);

  // Calculate percentage and fill level
  useEffect(() => {
    const newPercentage = Math.min(Math.round((currentSavings / savingsGoal) * 100), 100);
    setPercentage(newPercentage);

    // Determine fill level
    if (newPercentage === 0) {
      setFillLevel('empty');
    } else if (newPercentage <= 25) {
      setFillLevel('low');
    } else if (newPercentage <= 50) {
      setFillLevel('medium');
    } else if (newPercentage <= 75) {
      setFillLevel('high');
    } else {
      setFillLevel('full');
    }

    // Trigger animations when savings increases
    if (currentSavings > prevSavingsRef.current) {
      triggerUpdateAnimation();
    }
    prevSavingsRef.current = currentSavings;
  }, [currentSavings, savingsGoal]);

  // Idle animation timer
  useEffect(() => {
    const startIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setIdleShake(true);
        setTimeout(() => setIdleShake(false), 600);
      }, 5000);
    };

    startIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [currentSavings]);

  const triggerUpdateAnimation = () => {
    // Show coin dropping
    setShowCoin(true);
    setTimeout(() => setShowCoin(false), 2000);

    // Shake piggy bank
    setTimeout(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 1000);
  };

  const handleHover = () => {
    if (!isShaking) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  // Get fill color based on level
  const getFillColor = () => {
    switch (fillLevel) {
      case 'empty': return 'var(--muted-2, #9ca3af)';
      case 'low': return 'var(--warn, #f59e0b)';
      case 'medium': return 'var(--accent, #3baa6b)';
      case 'high': return 'var(--success, #10b981)';
      case 'full': return 'var(--brand-600, #059669)';
      default: return 'var(--muted-2, #9ca3af)';
    }
  };

  // Get body color based on level (subtle tint)
  const getBodyColor = () => {
    switch (fillLevel) {
      case 'empty': return '#fce7f3';
      case 'low': return '#fef3c7';
      case 'medium': return '#d1fae5';
      case 'high': return '#a7f3d0';
      case 'full': return '#6ee7b7';
      default: return '#fce7f3';
    }
  };

  const size = compact ? 180 : 240;

  return (
    <div className={`piggy-bank-container ${compact ? 'compact' : ''}`}>
      <div
        className={`piggy-bank ${isShaking ? 'shake' : ''} ${idleShake ? 'idle-shake' : ''}`}
        onMouseEnter={handleHover}
        role="img"
        aria-label={`Piggy bank showing ${percentage}% of savings goal`}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 240 240"
          className="piggy-bank-svg entrance-animation"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coin drop animation */}
          {showCoin && (
            <g className="coin-drop">
              <circle cx="120" cy="30" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
              <text x="120" y="36" fontSize="14" fill="#92400e" textAnchor="middle" fontWeight="bold">$</text>
            </g>
          )}

          {/* Shadow */}
          <ellipse cx="120" cy="210" rx="80" ry="12" fill="rgba(0,0,0,0.1)" />

          {/* Piggy bank body */}
          <g className="piggy-body">
            {/* Main body - ellipse */}
            <ellipse
              cx="120"
              cy="130"
              rx="70"
              ry="50"
              fill={getBodyColor()}
              stroke="#ec4899"
              strokeWidth="3"
            />

            {/* Fill level indicator (inside body) */}
            <defs>
              <clipPath id="body-clip">
                <ellipse cx="120" cy="130" rx="67" ry="47" />
              </clipPath>
            </defs>
            <rect
              x="50"
              y={130 + 50 - (100 * percentage / 100)}
              width="140"
              height={(100 * percentage / 100)}
              fill={getFillColor()}
              opacity="0.3"
              clipPath="url(#body-clip)"
              className="fill-animation"
            />

            {/* Head (circle on left side of body) */}
            <circle
              cx="85"
              cy="110"
              r="38"
              fill={getBodyColor()}
              stroke="#ec4899"
              strokeWidth="3"
            />

            {/* Ears */}
            <ellipse
              cx="70"
              cy="82"
              rx="10"
              ry="16"
              fill={getBodyColor()}
              stroke="#ec4899"
              strokeWidth="3"
              transform="rotate(-25 70 82)"
            />
            <ellipse
              cx="100"
              cy="78"
              rx="10"
              ry="16"
              fill={getBodyColor()}
              stroke="#ec4899"
              strokeWidth="3"
              transform="rotate(25 100 78)"
            />

            {/* Eyes */}
            <circle cx="75" cy="105" r="5" fill="#1f2937" className="eye" />
            <circle cx="95" cy="105" r="5" fill="#1f2937" className="eye" />
            <circle cx="77" cy="103" r="2" fill="white" /> {/* eye shine */}
            <circle cx="97" cy="103" r="2" fill="white" />

            {/* Snout */}
            <ellipse
              cx="85"
              cy="125"
              rx="20"
              ry="15"
              fill="#fda4af"
              stroke="#ec4899"
              strokeWidth="3"
            />
            {/* Nostrils */}
            <ellipse cx="78" cy="125" rx="3" ry="4" fill="#be185d" />
            <ellipse cx="92" cy="125" rx="3" ry="4" fill="#be185d" />

            {/* Coin slot on top of body (back) */}
            <rect
              x="121"
              y="85"
              width="20"
              height="4"
              rx="2"
              fill="#be185d"
            />

            {/* Legs */}
            <rect x="75" y="170" width="15" height="30" rx="7" fill={getBodyColor()} stroke="#ec4899" strokeWidth="3" />
            <rect x="110" y="170" width="15" height="30" rx="7" fill={getBodyColor()} stroke="#ec4899" strokeWidth="3" />
            <rect x="150" y="170" width="15" height="30" rx="7" fill={getBodyColor()} stroke="#ec4899" strokeWidth="3" />

            {/* Tail (curly) */}
            <path
              d="M 185 120 Q 200 115, 205 125 Q 210 135, 200 140"
              stroke="#ec4899"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Savings info */}
      <div className="piggy-bank-info">
        <div className="savings-percentage">
          {percentage}%
        </div>
        <div className="savings-label">
          of goal
        </div>
        {!compact && (
          <div className="savings-details">
            <span className="current">${(currentSavings / 100).toFixed(2)}</span>
            <span className="separator">/</span>
            <span className="goal">${(savingsGoal / 100).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
