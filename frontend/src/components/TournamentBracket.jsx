import Bracket from './bracket/Bracket'

function TournamentBracket({ bracket, onEditScore, roundLabelFn, readOnly = false }) {
  return (
    <Bracket
      bracket={bracket}
      onEditScore={onEditScore}
      roundLabelFn={roundLabelFn}
      readOnly={readOnly}
    />
  )
}

export default TournamentBracket
