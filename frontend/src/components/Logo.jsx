// Logo Component - Reusable SVG Logo for Budget CAR
export default function Logo({ className = "" }) {
  return (
    <div className={`logo ${className}`} aria-label="Budget CAR logo">
      <svg viewBox="0 0 80 80" role="img" aria-labelledby="logoTitle logoDesc">
        <title id="logoTitle">Budget CAR logo</title>
        <desc id="logoDesc">Green car silhouette with a gold coin representing money and the CAR acronym.</desc>

        <defs>
          <linearGradient id="mintGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3baa6b" />
            <stop offset="1" stopColor="#69c08e" />
          </linearGradient>
          <radialGradient id="coinGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff4cc" />
            <stop offset="45%" stopColor="#ffd76a" />
            <stop offset="100%" stopColor="#e7b84b" />
          </radialGradient>
        </defs>

        {/* Soft mint tile background */}
        <rect x="0" y="0" width="80" height="80" rx="14" fill="url(#mintGrad)" opacity="0.18" />

        {/* Coin behind car */}
        <circle cx="56" cy="26" r="16" fill="url(#coinGrad)" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
        <text 
          x="56" 
          y="30" 
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" 
          fontWeight="900"
          fontSize="12" 
          fill="#5a3b00"
        >
          $
        </text>

        {/* Car body */}
        <g transform="translate(10,36)">
          <path 
            d="M8 16h36c2 0 3-1 3-3v-4c0-.7-.2-1.3-.6-1.9l-3.4-5.2C41.5 0.8 40.3 0 39 0H20c-1.3 0-2.5.8-3 2.0l-2 5.0H8 c-2.2 0-4 1.8-4 4v2c0 1.7 1.3 3 3 3z" 
            fill="#3baa6b" 
          />
          {/* Wheels */}
          <circle cx="16" cy="16" r="4" fill="#1f2b25" />
          <circle cx="36" cy="16" r="4" fill="#1f2b25" />
          <circle cx="16" cy="16" r="2" fill="#b9c9c1" />
          <circle cx="36" cy="16" r="2" fill="#b9c9c1" />
        </g>

        {/* CAR letters */}
        <text 
          x="26" 
          y="53" 
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          fontWeight="900" 
          fontSize="11" 
          fill="#0f3b25" 
          opacity=".9"
        >
          CAR
        </text>
      </svg>
    </div>
  );
}
