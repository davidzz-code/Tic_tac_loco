import { TURNS } from '../constants'

const COLORS = {
  [TURNS.X]: '#ef4444', // red-500
  [TURNS.O]: '#3b82f6', // blue-500
}

// 'round' = pen/marker look (matches the "drawn" feel).
// Switch to 'butt' for crisp, flat, geometric ends.
const LINE_CAP = 'round'

// Renders an X or O as an SVG that "draws itself" (stroke animation),
// like sketching on paper. `animate={false}` shows it fully drawn (static),
// used for the turn indicator.
export default function Mark({ value, animate = false, className = '' }) {
  if (value !== TURNS.X && value !== TURNS.O) return null

  const isX = value === TURNS.X
  const stroke = COLORS[value]

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-[80%] h-[80%] overflow-visible ${className}`}
      fill="none"
      stroke={stroke}
      strokeWidth={isX ? 11 : 9}
      strokeLinecap={LINE_CAP}
    >
      {isX ? (
        <>
          <line x1="22" y1="22" x2="78" y2="78" pathLength="1" className={animate ? 'mark-draw' : ''} />
          <line x1="78" y1="22" x2="22" y2="78" pathLength="1" className={animate ? 'mark-draw mark-x-2' : ''} />
        </>
      ) : (
        <circle cx="50" cy="50" r="33" pathLength="1" className={animate ? 'mark-draw mark-o' : ''} />
      )}
    </svg>
  )
}
