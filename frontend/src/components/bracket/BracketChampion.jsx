/**
 * BracketChampion
 *
 * The final column after all rounds — a gold trophy card.
 * Centered vertically in the bracket.
 *
 * Props
 *  - championName : string
 *  - totalHeight  : number  (used to centre the card)
 *  - cardHeight   : number  (120px base card, champion is taller)
 */
function BracketChampion({ championName, totalHeight }) {
  return (
    <div className="bch-col" style={{ height: totalHeight }}>
      <div className="bch-card">
        <div className="bch-trophy">🏆</div>
        <div className="bch-badge">Champion</div>
        <div className="bch-name" title={championName}>
          {championName || 'TBD'}
        </div>
        <div className="bch-sub">Tournament Winner</div>
      </div>
    </div>
  )
}

export default BracketChampion
