import { useState } from 'react'
import { X, Swords, CheckCircle } from 'lucide-react'
import './MatchScoreForm.css'

function MatchScoreForm({ match, onSubmit, onCancel, loading, error }) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [fieldError, setFieldError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setFieldError('')
    const first = Number(score1)
    const second = Number(score2)

    if (Number.isNaN(first) || first < 0) {
      setFieldError('Score 1 must be 0 or greater.')
      return
    }
    if (Number.isNaN(second) || second < 0) {
      setFieldError('Score 2 must be 0 or greater.')
      return
    }
    if (first === second) {
      setFieldError('Draws are not allowed. Scores must be different.')
      return
    }

    onSubmit({ score1: first, score2: second })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="score-form-title">

        <div className="modal-header">
          <Swords size={16} strokeWidth={2} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <h2 id="score-form-title">Update Match Score</h2>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close dialog">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* VS layout */}
            <div className="score-vs-grid">
              {/* Player 1 */}
              <div className="score-player-block">
                <div className="score-player-name">{match.participant1Name ?? 'TBD'}</div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="score1" className="score-label">Score</label>
                  <input
                    id="score1"
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="score-input"
                  />
                </div>
              </div>

              {/* VS divider */}
              <div className="score-vs-divider" aria-hidden="true">VS</div>

              {/* Player 2 */}
              <div className="score-player-block">
                <div className="score-player-name">{match.participant2Name ?? 'TBD'}</div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="score2" className="score-label">Score</label>
                  <input
                    id="score2"
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="score-input"
                  />
                </div>
              </div>
            </div>

            {fieldError && <div className="alert alert-error" role="alert">{fieldError}</div>}
            {error      && <div className="alert alert-error" role="alert">{error}</div>}

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle size={14} strokeWidth={2} />
              {loading ? 'Saving…' : 'Confirm Score'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default MatchScoreForm
