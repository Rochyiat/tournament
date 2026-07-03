/**
 * BracketConnector
 *
 * Draws the SVG connector lines between one round and the next.
 * For every pair of source cards (upper, lower) it draws:
 *
 *   upper card mid ──────┐
 *                        │  (vertical)
 *   lower card mid ──────┘
 *                        └──── leads to target card mid
 *
 * Props
 *  - sourcePositions  : number[]  Y-center of each source card (px, relative to bracket board)
 *  - targetPositions  : number[]  Y-center of each target card (px, relative to bracket board)
 *  - totalHeight      : number    Height of the SVG canvas
 *  - connectorWidth   : number    Width of the gap between rounds (= gap px)
 */
function BracketConnector({ sourcePositions, targetPositions, totalHeight, connectorWidth }) {
  // For each target card there are exactly 2 source cards.
  // Group source positions into pairs.
  const pairs = []
  for (let i = 0; i < targetPositions.length; i++) {
    const top = sourcePositions[i * 2]
    const bottom = sourcePositions[i * 2 + 1]
    const target = targetPositions[i]
    if (top !== undefined && bottom !== undefined) {
      pairs.push({ top, bottom, target })
    }
  }

  const halfW = connectorWidth / 2
  const strokeColor = 'var(--bc-color, #38bdf8)'
  const strokeWidth = 2

  return (
    <svg
      className="bc-svg"
      width={connectorWidth}
      height={totalHeight}
      style={{ overflow: 'visible', flexShrink: 0 }}
      aria-hidden="true"
    >
      {pairs.map(({ top, bottom, target }, idx) => (
        <g key={idx}>
          {/* Horizontal line from top source card to midpoint */}
          <line
            x1={0}
            y1={top}
            x2={halfW}
            y2={top}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Horizontal line from bottom source card to midpoint */}
          <line
            x1={0}
            y1={bottom}
            x2={halfW}
            y2={bottom}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Vertical bridge between the two horizontal lines */}
          <line
            x1={halfW}
            y1={top}
            x2={halfW}
            y2={bottom}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Horizontal line from midpoint to target card */}
          <line
            x1={halfW}
            y1={target}
            x2={connectorWidth}
            y2={target}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  )
}

export default BracketConnector
