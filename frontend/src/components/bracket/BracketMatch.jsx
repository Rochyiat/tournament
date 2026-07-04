/**
 * BracketMatch
 *
 * Match card. Width is fixed at 240px; height grows with content
 * (min-height via CSS, no fixed height, no overflow:hidden).
 *
 * Props
 *  - match       : object  Match data from the bracket API
 *  - onEditScore : fn      Called with the match when Edit is clicked
 */
function BracketMatch({ match, onEditScore, readOnly = false }) {
  const p1 = match.participant1Name || 'TBD'
  const p2 = match.participant2Name || (match.participant1Name ? 'BYE' : 'TBD')

  const isWin1 = Boolean(match.winnerName && match.winnerName === match.participant1Name)
  const isWin2 = Boolean(match.winnerName && match.winnerName === match.participant2Name)

  const canEdit =
    match.status === 'READY' ||
    (match.status === 'PENDING' && match.participant1Name && !match.participant2Name)

  const statusKey = (match.status || 'pending').toLowerCase()

  return (
    <article className="brk-card">

      {/* ── Header: match number + status ──────────────────────────── */}
      <div className="brk-card__head">
        <span className="brk-card__num">M{match.matchNumber}</span>
        <span className={`brk-badge brk-badge--${statusKey}`}>
          {match.status || 'PENDING'}
        </span>
      </div>

      {/* ── Players ────────────────────────────────────────────────── */}
      <div className="brk-card__players">

        <div className={`brk-card__player${isWin1 ? ' brk-card__player--win' : ''}`}>
          <span className="brk-card__side">P1</span>
          <span className="brk-card__name" title={p1}>{p1}</span>
          <span className="brk-card__score">{match.score1 ?? '–'}</span>
        </div>

        <div className="brk-card__divider" />

        <div className={`brk-card__player${isWin2 ? ' brk-card__player--win' : ''}`}>
          <span className="brk-card__side">P2</span>
          <span className="brk-card__name" title={p2}>{p2}</span>
          <span className="brk-card__score">{match.score2 ?? '–'}</span>
        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      {/*
        Footer is always rendered when there is anything to show.
        The card uses min-height (not fixed height) so this never clips.
      */}
      {(match.winnerName || canEdit) && (
        <div className="brk-card__foot">
          {match.winnerName ? (
            <span className="brk-card__winner" title={match.winnerName}>
              🏅 {match.winnerName}
            </span>
          ) : (
            <span className="brk-card__winner brk-card__winner--empty" />
          )}
          {canEdit && !readOnly && (
            <button
              type="button"
              className="brk-card__edit-btn"
              onClick={() => onEditScore(match)}
            >
              Edit Score
            </button>
          )}
        </div>
      )}

    </article>
  )
}

export default BracketMatch
