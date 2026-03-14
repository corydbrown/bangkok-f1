// Top-down F1 car SVG silhouette — 36×20 viewBox
export default function RaceCar({ color = '#e8312a' }) {
  const dark = 'rgba(0,0,0,0.55)'
  const mid  = 'rgba(0,0,0,0.25)'

  return (
    <svg
      viewBox="0 0 36 20"
      width="36"
      height="20"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Rear wing */}
      <rect x="0.5" y="3.5" width="4" height="13" rx="1" fill={color} opacity="0.85" />

      {/* Main body */}
      <polygon points="4,2.5 27,0.5 33.5,10 27,19.5 4,17.5" fill={color} />

      {/* Body highlight */}
      <polygon points="4,5 22,3 28,10 22,17 4,15" fill="rgba(255,255,255,0.08)" />

      {/* Cockpit */}
      <ellipse cx="15" cy="10" rx="5.5" ry="3.5" fill={dark} />

      {/* Halo */}
      <path
        d="M 11.5,9.5 Q 15,7 18.5,9.5"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Front wing */}
      <rect x="29.5" y="5.5" width="6" height="9" rx="0.5" fill={color} opacity="0.75" />

      {/* Left rear tyre */}
      <rect x="4.5" y="0.5" width="6.5" height="4" rx="1.5" fill={dark} />
      {/* Left front tyre */}
      <rect x="4.5" y="15.5" width="6.5" height="4" rx="1.5" fill={dark} />

      {/* Right rear tyre */}
      <rect x="18" y="0.5" width="5.5" height="3.5" rx="1.5" fill={dark} />
      {/* Right front tyre */}
      <rect x="18" y="16" width="5.5" height="3.5" rx="1.5" fill={dark} />

      {/* Tyre shine */}
      <rect x="5.5" y="1.5" width="2" height="1.5" rx="0.5" fill={mid} />
      <rect x="5.5" y="16.5" width="2" height="1.5" rx="0.5" fill={mid} />
    </svg>
  )
}
