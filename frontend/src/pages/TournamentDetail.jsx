import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tournamentApi } from '../api/tournament'
import { participantApi } from '../api/participant'
import { matchApi } from '../api/match'
import LoadingSpinner from '../components/LoadingSpinner'
import MatchScoreForm from '../components/MatchScoreForm'
import TournamentBracket from '../components/TournamentBracket'
import ParticipantManager from '../components/ParticipantManager'
import SeedingDialog from '../components/SeedingDialog'
import CustomSeedingModal from '../components/CustomSeedingModal'
import NavBar from '../components/NavBar'
import { useAuth } from '../context/AuthContext'
import {
  ChevronRight,
  Trophy,
  Info,
  Users,
  GitBranch,
  Gamepad2,
  Calendar,
  Clock,
  Shield,
  Zap,
  BarChart2,
  Hash,
  Swords,
  UserCircle,
} from 'lucide-react'
import './TournamentDetail.css'

const STATUS_LABEL = {
  DRAFT: 'Draft',
  READY: 'Ready',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished',
}

function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [availableParticipants, setAvailableParticipants] = useState([])
  const [registeredParticipants, setRegisteredParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState('')

  const [bracket, setBracket] = useState(null)
  const [bracketLoading, setBracketLoading] = useState(false)
  const [bracketError, setBracketError] = useState('')
  const [bracketMessage, setBracketMessage] = useState({ type: '', text: '' })
  const [generateLoading, setGenerateLoading] = useState(false)

  // ── Seeding dialog state ──────────────────────────────────────────────────
  const [showSeedingDialog, setShowSeedingDialog]   = useState(false)
  const [showCustomModal,   setShowCustomModal]     = useState(false)

  const [scoreModalMatch, setScoreModalMatch] = useState(null)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [scoreError, setScoreError] = useState('')

  // ── Ownership check ───────────────────────────────────────────────────────
  const isAdmin = currentUser?.role === 'ADMIN'
  const isOwner =
    tournament !== null &&
    (tournament.ownerId === currentUser?.id ||
      tournament.ownerUsername === currentUser?.username)
  const canEdit = isAdmin || isOwner

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      setError('')
      setTournament(null)
      try {
        const res = await tournamentApi.getById(id)
        setTournament(res.data.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Tournament not found.')
        } else {
          setError(err.response?.data?.message || 'Failed to load tournament.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  async function loadParticipants() {
    if (!tournament) return
    setParticipantsLoading(true)
    setRegistrationError('')
    try {
      const [allRes, registeredRes] = await Promise.all([
        participantApi.getAll(),
        tournamentApi.getParticipants(id),
      ])
      const registered = registeredRes.data.data ?? []
      setRegisteredParticipants(registered)
      const allParticipants = allRes.data.data ?? []
      const registeredIds = new Set(registered.map((r) => r.participantId))
      const available = allParticipants.filter((p) => !registeredIds.has(p.id))
      setAvailableParticipants(available)
    } catch (err) {
      setRegistrationError(err.response?.data?.message || 'Failed to load registration data.')
    } finally {
      setParticipantsLoading(false)
    }
  }

  const canModifyRegistration = canEdit && tournament?.status === 'DRAFT'

  useEffect(() => {
    loadParticipants()
  }, [id, tournament])

  async function fetchBracket() {
    if (!tournament) return
    setBracketLoading(true)
    setBracketError('')
    try {
      const res = await tournamentApi.getBracket(id)
      setBracket(res.data.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setBracket(null)
      } else {
        setBracketError(err.response?.data?.message || 'Failed to load bracket.')
      }
    } finally {
      setBracketLoading(false)
    }
  }

  useEffect(() => {
    if (!tournament) return
    fetchBracket()
  }, [id, tournament?.status, tournament?.id])

  async function refreshTournament() {
    try {
      const res = await tournamentApi.getById(id)
      setTournament(res.data.data)
    } catch { /* ignore */ }
  }

  function getRoundLabel(roundNumber, totalRounds) {
    if (roundNumber === totalRounds) return 'Final'
    if (roundNumber === totalRounds - 1 && totalRounds >= 2) return 'Semifinal'
    if (roundNumber === totalRounds - 2 && totalRounds >= 3) return 'Quarterfinal'
    return `Round ${roundNumber}`
  }

  // ── Generate bracket: shared finisher ────────────────────────────────────
  async function doGenerate(body) {
    setGenerateLoading(true)
    setBracketMessage({ type: '', text: '' })
    setBracketError('')
    try {
      await tournamentApi.generateBracket(id, body)
      setBracketMessage({ type: 'success', text: 'Bracket generated successfully.' })
      await refreshTournament()
      await fetchBracket()
    } catch (err) {
      setBracketMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to generate bracket.',
      })
    } finally {
      setGenerateLoading(false)
    }
  }

  // ── "Generate Bracket" button click → open seeding picker ────────────────
  function handleGenerateClick() {
    if (!tournament || !canEdit) return
    setShowSeedingDialog(true)
  }

  // ── SeedingDialog: Random chosen ─────────────────────────────────────────
  async function handleSeedingRandom() {
    setShowSeedingDialog(false)
    await doGenerate({ seedingType: 'RANDOM' })
  }

  // ── SeedingDialog: Custom chosen → open CustomSeedingModal ───────────────
  function handleSeedingCustom() {
    setShowSeedingDialog(false)
    setShowCustomModal(true)
  }

  // ── CustomSeedingModal: generate with ordered IDs ─────────────────────────
  async function handleCustomGenerate(orderedIds) {
    setShowCustomModal(false)
    await doGenerate({ seedingType: 'CUSTOM', participantIds: orderedIds })
  }

  async function handleScoreSubmit(scores) {
    if (!scoreModalMatch || !canEdit) return
    setScoreLoading(true)
    setScoreError('')
    try {
      await matchApi.updateScore(scoreModalMatch.id, scores)
      setScoreModalMatch(null)
      await refreshTournament()
      await fetchBracket()
    } catch (err) {
      setScoreError(err.response?.data?.message || 'Failed to update score.')
    } finally {
      setScoreLoading(false)
    }
  }

  async function handleSave(toAdd, toRemove) {
    setRegistrationError('')
    try {
      for (const participantId of toAdd) {
        await tournamentApi.registerParticipant(id, { participantId })
      }
      for (const participantId of toRemove) {
        await tournamentApi.unregisterParticipant(id, participantId)
      }
      await refreshTournament()
      await loadParticipants()
    } catch (err) {
      setRegistrationError(err.response?.data?.message || 'Failed to save participant changes.')
      throw err
    }
  }

  const registeredCount = registeredParticipants.length
  const isFull = tournament ? registeredCount >= tournament.maxParticipants : false
  const fillPct = tournament
    ? Math.round((registeredCount / tournament.maxParticipants) * 100)
    : 0
  const championName =
    bracket?.rounds?.[bracket?.totalRounds]?.[0]?.winnerName || ''

  // Participants formatted for CustomSeedingModal: { id, name }
  const seedingParticipants = registeredParticipants.map((tp) => ({
    id: tp.participantId,
    name: tp.participantName,
  }))

  return (
    <div>
      <NavBar />
      <div className="page-container">

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <ChevronRight size={13} className="breadcrumb-sep" />
          <Link to="/tournaments">Tournaments</Link>
          <ChevronRight size={13} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{tournament?.name ?? 'Detail'}</span>
        </nav>

        {loading && <LoadingSpinner message="Loading tournament…" />}

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/tournaments')}
              >
                Back to list
              </button>
            </div>
          </div>
        )}

        {tournament && (
          <>
            {/* ── Tournament Banner ── */}
            <div className="td-banner">
              <div
                className={`td-banner-stripe td-banner-stripe--${tournament.status?.toLowerCase()}`}
              />
              <div className="td-banner-body">
                <div className="td-banner-left">
                  <div className="td-banner-icon">
                    <Trophy size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="td-banner-meta">
                      <span className={`badge badge-${tournament.status?.toLowerCase()}`}>
                        {STATUS_LABEL[tournament.status] ?? tournament.status}
                      </span>
                      <span className="td-banner-game">
                        <Gamepad2 size={13} strokeWidth={2} />
                        {tournament.game}
                      </span>
                    </div>
                    <h1 className="td-banner-title">{tournament.name}</h1>
                    <p className="td-banner-host">
                      Hosted by <strong>{tournament.host}</strong>
                    </p>
                  </div>
                </div>
                {championName && (
                  <div className="td-champion-badge">
                    <Trophy size={18} strokeWidth={1.5} />
                    <div>
                      <span className="td-champion-label">Champion</span>
                      <span className="td-champion-name">{championName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Info + Stats row ── */}
            <div className="td-two-col">

              {/* Info card */}
              <div className="section-card">
                <div className="section-card-header">
                  <h3><Info size={15} /> Tournament Information</h3>
                </div>
                <div className="section-card-body">
                  <div className="td-info-grid">
                    <div className="td-info-field">
                      <dt><Gamepad2 size={13} /> Game</dt>
                      <dd>{tournament.game}</dd>
                    </div>
                    <div className="td-info-field">
                      <dt><Shield size={13} /> Host</dt>
                      <dd>{tournament.host}</dd>
                    </div>
                    <div className="td-info-field td-info-field--organizer">
                      <dt><UserCircle size={13} /> Organizer</dt>
                      <dd>
                        <span className="td-organizer-name">
                          {tournament.ownerUsername ?? '—'}
                        </span>
                        {canEdit ? (
                          <span className="td-organizer-badge td-organizer-badge--you">
                            You are the organizer
                          </span>
                        ) : (
                          <span className="td-organizer-badge td-organizer-badge--view">
                            View Only
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="td-info-field">
                      <dt><Users size={13} /> Capacity</dt>
                      <dd>{tournament.maxParticipants} participants</dd>
                    </div>
                    <div className="td-info-field">
                      <dt><Calendar size={13} /> Created</dt>
                      <dd>
                        {tournament.createdAt
                          ? new Date(tournament.createdAt).toLocaleString()
                          : '—'}
                      </dd>
                    </div>
                    <div className="td-info-field">
                      <dt><Clock size={13} /> Updated</dt>
                      <dd>
                        {tournament.updatedAt
                          ? new Date(tournament.updatedAt).toLocaleString()
                          : '—'}
                      </dd>
                    </div>
                  </div>
                  {tournament.description && (
                    <div className="td-description">
                      <p>{tournament.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats card */}
              <div className="section-card">
                <div className="section-card-header">
                  <h3><BarChart2 size={15} /> Tournament Statistics</h3>
                </div>
                <div className="section-card-body">
                  <div className="td-stat-grid">
                    <div className="td-stat-item">
                      <div className="td-stat-icon td-stat-icon--blue"><Users size={16} /></div>
                      <span className="td-stat-value">{registeredCount}</span>
                      <span className="td-stat-label">Registered</span>
                    </div>
                    <div className="td-stat-item">
                      <div className="td-stat-icon td-stat-icon--cyan"><Hash size={16} /></div>
                      <span className="td-stat-value">{tournament.maxParticipants}</span>
                      <span className="td-stat-label">Capacity</span>
                    </div>
                    <div className="td-stat-item">
                      <div className="td-stat-icon td-stat-icon--amber">
                        <GitBranch size={16} />
                      </div>
                      <span className="td-stat-value">{bracket?.totalRounds ?? '—'}</span>
                      <span className="td-stat-label">Rounds</span>
                    </div>
                    <div className="td-stat-item">
                      <div className="td-stat-icon td-stat-icon--green"><Swords size={16} /></div>
                      <span className="td-stat-value">{bracket?.totalMatches ?? '—'}</span>
                      <span className="td-stat-label">Matches</span>
                    </div>
                  </div>
                  {/* Capacity progress */}
                  <div className="td-capacity-bar-wrap">
                    <div className="td-capacity-bar-header">
                      <span>Registration Capacity</span>
                      <span>{registeredCount} / {tournament.maxParticipants}</span>
                    </div>
                    <div className="td-capacity-bar-track">
                      <div
                        className={`td-capacity-bar-fill ${
                          isFull ? 'td-capacity-bar-fill--full' : ''
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <span
                      className={`badge ${isFull ? 'badge-full' : 'badge-open'}`}
                      style={{ marginTop: '0.5rem' }}
                    >
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Participants section ── */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><Users size={15} /> Participants</h3>
                <span className="td-participant-count">
                  {registeredCount} / {tournament.maxParticipants}
                </span>
              </div>
              <div className="section-card-body">
                {registrationError && (
                  <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>
                    {registrationError}
                  </div>
                )}

                {canModifyRegistration ? (
                  <ParticipantManager
                    availableParticipants={availableParticipants}
                    registeredParticipants={registeredParticipants}
                    tournament={tournament}
                    loading={participantsLoading}
                    onSave={handleSave}
                    error={null}
                  />
                ) : (
                  participantsLoading ? (
                    <LoadingSpinner message="Loading participants…" />
                  ) : registeredParticipants.length === 0 ? (
                    <p className="td-empty-hint">No participants registered yet.</p>
                  ) : (
                    <div className="td-participant-table-wrap">
                      <table className="td-participant-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredParticipants.map((p, idx) => (
                            <tr key={p.id}>
                              <td className="td-participant-num">{idx + 1}</td>
                              <td>{p.participantName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ── Bracket section ── */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><GitBranch size={15} /> Bracket</h3>
                {canEdit && tournament.status === 'READY' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleGenerateClick}
                    disabled={generateLoading}
                  >
                    <Zap size={13} strokeWidth={2} />
                    {generateLoading ? 'Generating…' : 'Generate Bracket'}
                  </button>
                )}
              </div>
              <div className="section-card-body">
                {bracketMessage.text && (
                  <div
                    className={
                      bracketMessage.type === 'success'
                        ? 'alert alert-success'
                        : 'alert alert-error'
                    }
                    role="alert"
                  >
                    {bracketMessage.text}
                  </div>
                )}
                {bracketError && (
                  <div className="alert alert-error" role="alert">{bracketError}</div>
                )}

                {bracketLoading ? (
                  <LoadingSpinner message="Loading bracket…" />
                ) : bracket ? (
                  <TournamentBracket
                    bracket={bracket}
                    onEditScore={canEdit ? setScoreModalMatch : null}
                    roundLabelFn={getRoundLabel}
                    readOnly={!canEdit}
                  />
                ) : (
                  <div className="td-bracket-empty">
                    <GitBranch size={32} strokeWidth={1} />
                    <p>No bracket generated yet.</p>
                    {tournament.status !== 'READY' && (
                      <p className="td-empty-hint">
                        Fill all participant slots to unlock bracket generation.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>

      {/* ── Seeding method picker dialog ── */}
      {showSeedingDialog && (
        <SeedingDialog
          onSelectRandom={handleSeedingRandom}
          onSelectCustom={handleSeedingCustom}
          onCancel={() => setShowSeedingDialog(false)}
        />
      )}

      {/* ── Custom seeding full-screen modal ── */}
      {showCustomModal && (
        <CustomSeedingModal
          participants={seedingParticipants}
          onGenerate={handleCustomGenerate}
          onCancel={() => setShowCustomModal(false)}
        />
      )}

      {/* ── Score modal ── */}
      {scoreModalMatch && canEdit && (
        <MatchScoreForm
          match={scoreModalMatch}
          onSubmit={handleScoreSubmit}
          onCancel={() => setScoreModalMatch(null)}
          loading={scoreLoading}
          error={scoreError}
        />
      )}
    </div>
  )
}

export default TournamentDetail
