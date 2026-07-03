import { useState } from 'react'

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
          <h2 id="score-form-title">Update Match Score</h2>
          <button className="btn btn-ghost btn-sm" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label>Participant 1</label>
              <input type="text" value={match.participant1Name ?? 'TBD'} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="score1">Score 1</label>
              <input
                id="score1"
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Participant 2</label>
              <input type="text" value={match.participant2Name ?? 'TBD'} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="score2">Score 2</label>
              <input
                id="score2"
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
              />
            </div>
            {fieldError && <div className="alert alert-error" role="alert">{fieldError}</div>}
            {error && <div className="alert alert-error" role="alert">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MatchScoreForm
