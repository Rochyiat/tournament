import Bracket from './bracket/Bracket'

function TournamentBracket({ bracket, onEditScore, roundLabelFn }) {
  return <Bracket bracket={bracket} onEditScore={onEditScore} roundLabelFn={roundLabelFn} />
}

export default TournamentBracket
