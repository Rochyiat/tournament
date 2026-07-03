import './Bracket.css'
import BracketRound from './BracketRound'
import BracketMatch from './BracketMatch'
import BracketConnector from './BracketConnector'
import BracketChampion from './BracketChampion'

// ─── Layout constants ──────────────────────────────────────────────────────────
const CARD_HEIGHT = 120    // px — fixed card height
const CARD_GAP    = 20     // px — gap between cards in round 1
const ROUND_WIDTH = 260    // px — fixed card / column width
const CONNECTOR_W = 80     // px — horizontal gap between rounds (SVG canvas width)
const LABEL_H     = 36     // px — round label height above the board

/**
 * Compute the Y-center of each card in a given round.
 *
 * Round 1 cards are spaced by (CARD_HEIGHT + CARD_GAP).
 * Each subsequent round the stride doubles, and cards are
 * centered between the pair from the previous round.
 *
 * @param {number} roundNumber   1-based
 * @param {number} matchCount    number of matches in that round
 */
function getYCenters(roundNumber, matchCount) {
  const stride = (CARD_HEIGHT + CARD_GAP) * Math.pow(2, roundNumber - 1)
  const firstTop = (stride - CARD_HEIGHT) / 2
  return Array.from({ length: matchCount }, (_, i) => firstTop + i * stride + CARD_HEIGHT / 2)
}

/**
 * Total board height is determined by round 1 match count.
 * Every subsequent round fits exactly within the same height.
 */
function getTotalHeight(round1MatchCount) {
  return round1MatchCount * (CARD_HEIGHT + CARD_GAP) - CARD_GAP
}

// ──────────────────────────────────────────────────────────────────────────────

function Bracket({ bracket, onEditScore, roundLabelFn }) {
  if (!bracket || !bracket.rounds) return null

  const totalRounds = bracket.totalRounds || 0

  // Sort rounds numerically
  const roundNumbers = Object.keys(bracket.rounds)
    .map(Number)
    .sort((a, b) => a - b)

  const rounds = roundNumbers.map((n) => ({
    roundNumber: n,
    label: roundLabelFn(n, totalRounds),
    matches: bracket.rounds[n] || [],
  }))

  if (rounds.length === 0) return null

  // The first round determines the total board height
  const round1Count = rounds[0].matches.length
  const totalHeight = getTotalHeight(round1Count)

  // Champion name comes from the winner of the final match
  const finalMatch = rounds[rounds.length - 1]?.matches?.[0]
  const championName = finalMatch?.winnerName || ''

  return (
    <div className="bracket-wrap">
      {/* Scrollable horizontal board */}
      <div className="bracket-board">
        {/* Round label row */}
        <div className="bracket-labels" style={{ paddingLeft: 0 }}>
          {rounds.map((round) => (
            <div
              key={round.roundNumber}
              className="bracket-label-cell"
              style={{ width: ROUND_WIDTH + CONNECTOR_W }}
            >
              {round.label}
            </div>
          ))}
          {/* Champion label */}
          <div className="bracket-label-cell bracket-label-cell--champion">
            Champion
          </div>
        </div>

        {/* Card + connector row */}
        <div className="bracket-row" style={{ height: totalHeight }}>
          {rounds.map((round, ri) => {
            const isLast = ri === rounds.length - 1

            // Y-centers for source cards in this round
            const sourceCenters = getYCenters(round.roundNumber, round.matches.length)

            // Y-centers for target cards (next round)
            const nextRound = rounds[ri + 1]
            const targetCenters = nextRound
              ? getYCenters(nextRound.roundNumber, nextRound.matches.length)
              : []

            return (
              <div key={round.roundNumber} className="bracket-col-group">
                {/* The round column (cards absolutely positioned) */}
                <div
                  className="bracket-round-col"
                  style={{ width: ROUND_WIDTH, height: totalHeight }}
                >
                  {round.matches.map((match, mi) => {
                    const stride = (CARD_HEIGHT + CARD_GAP) * Math.pow(2, round.roundNumber - 1)
                    const firstTop = (stride - CARD_HEIGHT) / 2
                    const top = firstTop + mi * stride

                    return (
                      <div
                        key={match.id ?? match.matchNumber}
                        className="bracket-slot"
                        style={{ top, height: CARD_HEIGHT, width: ROUND_WIDTH }}
                      >
                        <BracketMatch match={match} onEditScore={onEditScore} />
                      </div>
                    )
                  })}
                </div>

                {/* SVG connector between this round and the next */}
                {!isLast && nextRound && (
                  <BracketConnector
                    sourcePositions={sourceCenters}
                    targetPositions={targetCenters}
                    totalHeight={totalHeight}
                    connectorWidth={CONNECTOR_W}
                  />
                )}

                {/* Last connector: from final round to champion */}
                {isLast && (
                  <div
                    className="bracket-final-line"
                    style={{
                      width: CONNECTOR_W,
                      height: totalHeight,
                    }}
                  >
                    {/* A simple horizontal line to champion */}
                    <svg width={CONNECTOR_W} height={totalHeight} style={{ overflow: 'visible' }} aria-hidden="true">
                      <line
                        x1={0}
                        y1={totalHeight / 2}
                        x2={CONNECTOR_W}
                        y2={totalHeight / 2}
                        stroke="var(--bc-color, #f59e0b)"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}

          {/* Champion card */}
          <BracketChampion
            championName={championName}
            totalHeight={totalHeight}
          />
        </div>
      </div>
    </div>
  )
}

export default Bracket
