import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Trophy, ChevronRight, Info, Users, GitBranch,
  Gamepad2, Calendar, Clock, Shield, Hash,
  Swords, BarChart2, Crown,
} from 'lucide-react'
import PublicNavBar from '../components/PublicNavBar'
import TournamentBracket from '../components/TournamentBracket'
import LoadingSpinner from '../components/LoadingSpinner'
import { publicTournamentApi } from '../api/publicApi'
import './PublicTournamentDetail.css'

const STATUS_LABEL = { DRAFT: 'Draft', READY: 'Ready', ONGOING: 'Ongoing', FINISHED: 'Finished' }

function getGameColor(game = '') {
  const g = game.toLowerCase()
  if (g.includes('valorant'))         return '#ff4655'
  if (g.includes('mobile legends') || g.includes('ml')) return '#00b0ff'
  if (g.includes('dota'))             return '#c23b22'
  if (g.includes('cs') || g.includes('counter')) return '#f5a623'
  if (g.includes('pubg'))             return '#f0a500'
  if (g.includes('league'))           return '#c89b3c'
  return 'var(--primary)'
}

function getRoundLabel(roundNumber, totalRounds) {
  if (roundNumber === totalRounds) return 'Final'
  if (roundNumber === totalRounds - 1 && totalRounds >= 2) return 'Semifinal'
  if (roundNumber === totalRounds - 2 && totalRounds >= 3) return 'Quarterfinal'
  return `Round ${roundNumber}`
}

// Public-safe bracket: suppress all Edit Score actions
function noop() {}

export default function PublicTournamentDetail() {
  const { id } = useParams()

  const [tournament,    setTournament]    = useState(null)
  const [participants,  setParticipants]  = useState([])
  const [bracket,       setBracket]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([
      publicTournamentApi.getById(id),
      publicTournamentApi.getParticipants(id),
      publicTournamentApi.getBracket(id).catch(() => null),
    ])
      .then(([tRes, pRes, bRes]) => {
        setTournament(tRes.data.data)
        setParticipants(pRes.data.data ?? [])
        setBracket(bRes?.data?.data ?? null)
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setError('Tournament not found.')
        } else {
          setError('Could not load tournament. Please try again later.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const championName = bracket?.rounds?.[bracket?.totalRounds]?.[0]?.winnerName || ''
  const gameColor = getGameColor(tournament?.game)

  return (
    <div className="pub-page">
      <PublicNavBar />
      <div className="pub-page-inner">

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} className="breadcrumb-sep" />
          <Link to="/tournaments">Tournaments</Link>
          <ChevronRight size={13} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{tournament?.name ?? 'Detail'}</span>
        </nav>

        {loading && <LoadingSpinner message="Loading tournament…" />}
        {error && <div className="alert alert-error">{error}</div>}

        {tournament && (
          <>
            {/* ── Banner ── */}
            <div className="ptd-banner" style={{ '--game-color': gameColor }}>
              <div className="ptd-banner-stripe" />
              <div className="ptd-banner-body">
                <div className="ptd-banner-left">
                  <div className="ptd-banner-icon">
                    <Trophy size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="ptd-banner-meta">
                      <span className={`badge badge-${tournament.status?.toLowerCase()}`}>
                        {STATUS_LABEL[tournament.status] ?? tournament.status}
                      </span>
                      <span className="ptd-banner-game">
                        <Gamepad2 size={13} strokeWidth={2} />
                        {tournament.game}
                      </span>
                    </div>
                    <h1 className="ptd-banner-title">{tournament.name}</h1>
                    <p className="ptd-banner-host">
                      Hosted by <strong>{tournament.host}</strong>
                    </p>
                  </div>
                </div>

                {/* Champion badge (only if finished) */}
                {championName && (
                  <div className="ptd-champion-badge">
                    <Crown size={18} strokeWidth={1.5} />
                    <div>
                      <span className="ptd-champion-label">Champion</span>
                      <span className="ptd-champion-name">{championName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Info + Stats ── */}
            <div className="ptd-two-col">

              <div className="section-card">
                <div className="section-card-header">
                  <h3><Info size={15} /> Tournament Information</h3>
                </div>
                <div className="section-card-body">
                  <div className="ptd-info-grid">
                    <div className="ptd-info-field">
                      <dt><Gamepad2 size={13} /> Game</dt>
                      <dd>{tournament.game}</dd>
                    </div>
                    <div className="ptd-info-field">
                      <dt><Shield size={13} /> Host</dt>
                      <dd>{tournament.host}</dd>
                    </div>
                    <div className="ptd-info-field">
                      <dt><Users size={13} /> Capacity</dt>
                      <dd>{tournament.maxParticipants} participants</dd>
                    </div>
                    <div className="ptd-info-field">
                      <dt><Calendar size={13} /> Created</dt>
                      <dd>{tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : '—'}</dd>
                    </div>
                    <div className="ptd-info-field">
                      <dt><Clock size={13} /> Updated</dt>
                      <dd>{tournament.updatedAt ? new Date(tournament.updatedAt).toLocaleDateString() : '—'}</dd>
                    </div>
                  </div>
                  {tournament.description && (
                    <div className="ptd-description">
                      <p>{tournament.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header">
                  <h3><BarChart2 size={15} /> Statistics</h3>
                </div>
                <div className="section-card-body">
                  <div className="ptd-stat-grid">
                    <div className="ptd-stat-item">
                      <div className="ptd-stat-icon ptd-stat-icon--blue"><Users size={16} /></div>
                      <span className="ptd-stat-value">{participants.length}</span>
                      <span className="ptd-stat-label">Registered</span>
                    </div>
                    <div className="ptd-stat-item">
                      <div className="ptd-stat-icon ptd-stat-icon--cyan"><Hash size={16} /></div>
                      <span className="ptd-stat-value">{tournament.maxParticipants}</span>
                      <span className="ptd-stat-label">Capacity</span>
                    </div>
                    <div className="ptd-stat-item">
                      <div className="ptd-stat-icon ptd-stat-icon--amber"><GitBranch size={16} /></div>
                      <span className="ptd-stat-value">{bracket?.totalRounds ?? '—'}</span>
                      <span className="ptd-stat-label">Rounds</span>
                    </div>
                    <div className="ptd-stat-item">
                      <div className="ptd-stat-icon ptd-stat-icon--green"><Swords size={16} /></div>
                      <span className="ptd-stat-value">{bracket?.totalMatches ?? '—'}</span>
                      <span className="ptd-stat-label">Matches</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Participants ── */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><Users size={15} /> Participants</h3>
                <span className="ptd-participant-count">
                  {participants.length} / {tournament.maxParticipants}
                </span>
              </div>
              <div className="section-card-body">
                {participants.length === 0 ? (
                  <p className="ptd-empty-hint">No participants registered yet.</p>
                ) : (
                  <div className="ptd-participant-table-wrap">
                    <table className="ptd-participant-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, idx) => (
                          <tr key={p.id}>
                            <td className="ptd-participant-num">{idx + 1}</td>
                            <td>{p.participantName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bracket ── */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><GitBranch size={15} /> Bracket</h3>
              </div>
              <div className="section-card-body">
                {bracket ? (
                  /* Public view: read-only — no Edit Score button */
                  <TournamentBracket
                    bracket={bracket}
                    onEditScore={noop}
                    roundLabelFn={getRoundLabel}
                    readOnly
                  />
                ) : (
                  <div className="ptd-bracket-empty">
                    <GitBranch size={32} strokeWidth={1} />
                    <p>Bracket has not been generated yet.</p>
                    <p className="ptd-empty-hint">
                      Check back once the tournament starts.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  )
}
