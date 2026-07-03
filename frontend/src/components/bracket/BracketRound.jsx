import BracketMatch from './BracketMatch'

/**
 * BracketRound
 *
 * Renders a single column of matches for one round.
 * Uses absolute positioning so cards sit at mathematically
 * correct vertical positions for a proper tournament tree.
 *
 * Props
 *  - round        : { roundNumber, label, matches }
 *  - cardHeight   : number   Fixed card height in px (120)
 *  - cardGap      : number   Gap between cards in round 1 (20)
 *  - totalHeight  : number   Full column height for positioning context
 *  - onEditScore  : fn
 */
function BracketRound({ round, cardHeight, cardGap, totalHeight, onEditScore }) {
  // Spacing between card tops in this round:
  // Round 1 → stride = cardHeight + cardGap
  // Round 2 → stride doubles (cards center between pairs)
  // Round N → stride = (cardHeight + cardGap) * 2^(roundNumber-1)
  const stride = (cardHeight + cardGap) * Math.pow(2, round.roundNumber - 1)

  // First card's top offset: center it in the stride block
  const firstTop = (stride - cardHeight) / 2

  const positions = round.matches.map((_, i) => firstTop + i * stride)

  return (
    <div className="br-round">
      {/* Round label above the column */}
      <div className="br-label">{round.label}</div>

      {/* Match cards, absolutely positioned */}
      <div className="br-body" style={{ height: totalHeight }}>
        {round.matches.map((match, i) => (
          <div
            key={match.id ?? match.matchNumber}
            className="br-slot"
            style={{ top: positions[i], height: cardHeight }}
          >
            <BracketMatch match={match} onEditScore={onEditScore} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BracketRound
