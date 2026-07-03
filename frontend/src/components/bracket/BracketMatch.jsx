/**
 * BracketMatch
 * Fixed-size card (260×120px) showing one match.
 * Displays: match number, status badge, both participants,
 * current score, winner, and edit-score button when applicable.
 */
function BracketMatch({ match, onEditScore }) {
  const p1 = match.participant1Name || 'TBD'
  const p2 = match.participant2Name || (match.participant1Name ? 'BYE' : 'TBD')
  const isWinner1 = match.winnerName && match.winnerName === match.participant1Name
  const isWinner2 = match.winnerName && match.winnerName === match.participant2Name

  const canEdit =
    match.status === 'READY' ||
    (match.status === 'PENDING' && match.participant1Name && !match.participant2Name)

  return (
    <article className="bm-card">
      {/* Header: match number + status */}
      <div className="bm-header">
        <span className="bm-number">#{match.matchNumber}</span>
        <span className={`bm-status bm-status--${(match.status || 'pending').toLowerCase()}`}>
          {match.status || 'PENDING'}
        </span>
      </div>

      {/* Players */}
      <div className="bm-players">
        <div className={`bm-player ${isWinner1 ? 'bm-player--winner' : ''}`}>
          <span className="bm-player-label">P1</span>
          <span className="bm-player-name" title={p1}>{p1}</span>
          <span className="bm-player-score">{match.score1 ?? '–'}</span>
        </div>
        <div className={`bm-player ${isWinner2 ? 'bm-player--winner' : ''}`}>
          <span className="bm-player-label">P2</span>
          <span className="bm-player-name" title={p2}>{p2}</span>
          <span className="bm-player-score">{match.score2 ?? '–'}</span>
        </div>
      </div>

      {/* Footer: winner + edit button */}
      <div className="bm-footer">
        {match.winnerName ? (
          <span className="bm-winner" title={match.winnerName}>
            🏅 {match.winnerName}
          </span>
        ) : (
          <span className="bm-winner bm-winner--empty">No winner yet</span>
        )}
        {canEdit && (
          <button
            type="button"
            className="btn btn-secondary btn-sm bm-edit-btn"
            onClick={() => onEditScore(match)}
          >
            Edit
          </button>
        )}
      </div>
    </article>
  )
}

export default BracketMatch
