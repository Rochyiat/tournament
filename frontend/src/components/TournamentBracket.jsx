import Bracket from './bracket/Bracket'
import './TournamentBracket.css'

/**
 * Thin wrapper around Bracket that adds the seeding badge.
 *
 * Props:
 *   bracket       — BracketResponse (includes seedingType)
 *   onEditScore   — fn(match) | null
 *   roundLabelFn  — fn(roundNumber, totalRounds) → string
 *   readOnly      — bool
 */
function TournamentBracket({ bracket, onEditScore, roundLabelFn, readOnly = false }) {
  const seedingType = bracket?.seedingType   // "RANDOM" | "CUSTOM" | null/undefined

  return (
    <div className="tb-wrap">
      {/* Seeding badge — shown whenever we have a bracket */}
      {bracket && (
        <div className="tb-seeding-row">
          <span className={`tb-seeding-badge ${seedingType === 'CUSTOM' ? 'tb-seeding-badge--custom' : 'tb-seeding-badge--random'}`}>
            {seedingType === 'CUSTOM' ? '🎯 Custom Seeding' : '🎲 Random Seeding'}
          </span>
        </div>
      )}

      <Bracket
        bracket={bracket}
        onEditScore={onEditScore}
        roundLabelFn={roundLabelFn}
        readOnly={readOnly}
      />
    </div>
  )
}

export default TournamentBracket
