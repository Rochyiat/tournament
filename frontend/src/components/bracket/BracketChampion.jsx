/**
 * BracketChampion
 *
 * Absolutely positioned champion column — the last column in the bracket.
 * Vertically centered within the canvas.
 *
 * Props
 *  - championName : string   Tournament winner (empty = TBD)
 *  - left         : number   Left edge of this column in the canvas (px)
 *  - canvasHeight : number   Full canvas height for vertical centering (px)
 *  - width        : number   Column width (px)
 */

const CARD_H = 172  // champion card height

function BracketChampion({ championName, left, canvasHeight, width }) {
  const top = (canvasHeight - CARD_H) / 2

  return (
    <div
      className="brk-champ-col"
      style={{ left, top: 0, width, height: canvasHeight }}
    >
      <div
        className="brk-champ-card"
        style={{ top, width: width - 20 }}
      >
        <div className="brk-champ__trophy">🏆</div>
        <div className="brk-champ__badge">Champion</div>
        <div className="brk-champ__name" title={championName || 'TBD'}>
          {championName || 'TBD'}
        </div>
        <div className="brk-champ__sub">Tournament Winner</div>
      </div>
    </div>
  )
}

export default BracketChampion
