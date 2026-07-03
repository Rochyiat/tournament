import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tournamentApi } from '../api/tournament'
import { participantApi } from '../api/participant'
import { matchApi } from '../api/match'
import LoadingSpinner from '../components/LoadingSpinner'
import MatchScoreForm from '../components/MatchScoreForm'
import TournamentBracket from '../components/TournamentBracket'
import NavBar from '../components/NavBar'
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
  const { currentUser, logout } = useAuth()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [availableParticipants, setAvailableParticipants] = useState([])
  const [registeredParticipants, setRegisteredParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState('')

  const [bracket, setBracket] = useState(null)
  const [bracketLoading, setBracketLoading] = useState(false)
  const [bracketError, setBracketError] = useState('')
  const [bracketMessage, setBracketMessage] = useState({ type: '', text: '' })
  const [generateLoading, setGenerateLoading] = useState(false)
  const [scoreModalMatch, setScoreModalMatch] = useState(null)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [scoreError, setScoreError] = useState('')

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
      const registeredIds = new Set(registered.map((registration) => registration.participantId))
      const available = allParticipants.filter((participant) => !registeredIds.has(participant.id))
      setAvailableParticipants(available)

      if (selectedParticipantId && registeredIds.has(Number(selectedParticipantId))) {
        setSelectedParticipantId('')
      }
    } catch (err) {
      setRegistrationError(err.response?.data?.message || 'Failed to load registration data.')
    } finally {
      setParticipantsLoading(false)
    }
  }

  const canModifyRegistration = tournament?.status === 'DRAFT'

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
    } catch {
      // ignore, keep current tournament state
    }
  }

  function getRoundLabel(roundNumber, totalRounds) {
    if (roundNumber === totalRounds) return 'Final'
    if (roundNumber === totalRounds - 1 && totalRounds >= 2) return 'Semifinal'
    if (roundNumber === totalRounds - 2 && totalRounds >= 3) return 'Quarterfinal'
    return `Round ${roundNumber}`
  }

  async function handleGenerateBracket() {
    if (!tournament) return
    setGenerateLoading(true)
    setBracketMessage({ type: '', text: '' })
    setBracketError('')
    try {
      await tournamentApi.generateBracket(id)
      setBracketMessage({ type: 'success', text: 'Bracket generated successfully.' })
      await refreshTournament()
      await fetchBracket()
    } catch (err) {
      if (err.response?.status === 400) {
        setBracketMessage({ type: 'error', text: err.response?.data?.message || 'Invalid bracket generation request.' })
      } else if (err.response?.status === 404) {
        setBracketMessage({ type: 'error', text: 'Tournament not found.' })
      } else if (err.response?.status === 409) {
        setBracketMessage({ type: 'error', text: err.response?.data?.message || 'Bracket generation conflict.' })
      } else {
        setBracketMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate bracket.' })
      }
    } finally {
      setGenerateLoading(false)
    }
  }

  async function handleScoreSubmit(scores) {
    if (!scoreModalMatch) return
    setScoreLoading(true)
    setScoreError('')
    try {
      await matchApi.updateScore(scoreModalMatch.id, scores)
      setScoreModalMatch(null)
      await refreshTournament()
      await fetchBracket()
    } catch (err) {
      if (err.response?.status === 400) {
        setScoreError(err.response?.data?.message || 'Validation error.')
      } else if (err.response?.status === 404) {
        setScoreError('Match not found.')
      } else if (err.response?.status === 409) {
        setScoreError(err.response?.data?.message || 'Invalid match update.')
      } else {
        setScoreError(err.response?.data?.message || 'Failed to update score.')
      }
    } finally {
      setScoreLoading(false)
    }
  }

  async function handleRegister() {
    const participantId = Number(selectedParticipantId)
    if (!participantId || !tournament) return
    setRegistrationLoading(true)
    setRegistrationError('')
    try {
      await tournamentApi.registerParticipant(id, { participantId })
      setSelectedParticipantId('')
      await refreshTournament()
      await loadParticipants()
    } catch (err) {
      if (err.response?.status === 400) {
        setRegistrationError(err.response?.data?.message || 'Validation error.')
      } else if (err.response?.status === 404) {
        setRegistrationError('Tournament or participant not found.')
      } else if (err.response?.status === 409) {
        setRegistrationError(err.response?.data?.message || 'Registration failed: duplicate or tournament full.')
      } else {
        setRegistrationError(err.response?.data?.message || 'Failed to register participant.')
      }
    } finally {
      setRegistrationLoading(false)
    }
  }

  async function handleUnregister(participantId) {
    if (!tournament || !canModifyRegistration) return
    setRegistrationLoading(true)
    setRegistrationError('')
    try {
      await tournamentApi.unregisterParticipant(id, participantId)
      await refreshTournament()
      await loadParticipants()
    } catch (err) {
      if (err.response?.status === 404) {
        setRegistrationError('Tournament or participant not found.')
      } else {
        setRegistrationError(err.response?.data?.message || 'Failed to unregister participant.')
      }
    } finally {
      setRegistrationLoading(false)
    }
  }

  const registeredCount = registeredParticipants.length
  const isFull = tournament ? registeredCount >= tournament.maxParticipants : false
  const championName = bracket?.rounds?.[bracket?.totalRounds]?.[0]?.winnerName || ''

  return (
    <div>
      <NavBar />
      <div className="page-container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate('/tournaments')}>
          ← Back to Tournaments
        </button>

        {loading && <LoadingSpinner message="Loading tournament…" />}

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            <div style={{ marginTop: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tournaments')}>
                Back to list
              </button>
            </div>
          </div>
        )}

        {tournament && (
          <>
            <div className="detail-card">
              {/* Header */}
              <div className="detail-header">
                <div>
                  <span className={`badge badge-${tournament.status?.toLowerCase()}`}>
                    {STATUS_LABEL[tournament.status] ?? tournament.status}
                  </span>
                  <h1 className="detail-title">{tournament.name}</h1>
                  <p className="detail-host">Hosted by <strong>{tournament.host}</strong></p>
                </div>
              </div>

              {/* Info grid */}
              <div className="detail-grid">
                <div className="detail-field">
                  <dt>Game</dt>
                  <dd>{tournament.game}</dd>
                </div>
                <div className="detail-field">
                  <dt>Max Participants</dt>
                  <dd>{tournament.maxParticipants}</dd>
                </div>
                <div className="detail-field">
                  <dt>Status</dt>
                  <dd>
                    <span className={`badge badge-${tournament.status?.toLowerCase()}`}>
                      {STATUS_LABEL[tournament.status] ?? tournament.status}
                    </span>
                  </dd>
                </div>
                <div className="detail-field">
                  <dt>Created By</dt>
                  <dd>{tournament.createdByUsername ?? '—'}</dd>
                </div>
                <div className="detail-field">
                  <dt>Created At</dt>
                  <dd>{tournament.createdAt ? new Date(tournament.createdAt).toLocaleString() : '—'}</dd>
                </div>
                <div className="detail-field">
                  <dt>Last Updated</dt>
                  <dd>{tournament.updatedAt ? new Date(tournament.updatedAt).toLocaleString() : '—'}</dd>
                </div>
              </div>

              {/* Description */}
              {tournament.description && (
                <div className="detail-description">
                  <h3>Description</h3>
                  <p>{tournament.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="detail-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
                  Back to List
                </button>
              </div>
            </div>

            <div className="registration-panel">
              <div className="registration-section">
                <div className="registration-summary">
                  <span>Status: {STATUS_LABEL[tournament.status] ?? tournament.status}</span>
                  <span>Registered: {registeredCount} / {tournament.maxParticipants}</span>
                  <span>Capacity: {isFull ? 'Full' : 'Available'}</span>
                </div>
                <h3>Register Participants</h3>
                {registrationError && <div className="alert alert-error" role="alert">{registrationError}</div>}
                <div className="registration-actions">
                  <select
                    className="registration-select"
                    value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                    disabled={participantsLoading || availableParticipants.length === 0 || isFull || !canModifyRegistration}
                  >
                    <option value="">Select participant</option>
                    {availableParticipants.map((participant) => (
                      <option key={participant.id} value={participant.id}>{participant.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleRegister}
                    disabled={!selectedParticipantId || registrationLoading || participantsLoading || isFull || !canModifyRegistration}
                  >
                    {registrationLoading ? 'Registering…' : 'Register'}
                  </button>
                </div>
                {participantsLoading ? (
                  <LoadingSpinner message="Loading participants…" />
                ) : availableParticipants.length === 0 ? (
                  <p className="registration-empty">No available participants to register.</p>
                ) : null}
              </div>

              <div className="registration-section">
                <h3>Registered Participants</h3>
                {participantsLoading ? (
                  <LoadingSpinner message="Loading registered participants…" />
                ) : registeredParticipants.length === 0 ? (
                  <p className="registration-empty">No participants are currently registered.</p>
                ) : (
                  <table className="registration-list">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th style={{ width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredParticipants.map((participant) => (
                        <tr key={participant.id}>
                          <td>{participant.participantName}</td>
                          <td>
                            <div className="registration-actions">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUnregister(participant.participantId)}
                                disabled={registrationLoading || !canModifyRegistration}
                              >
                                {registrationLoading ? 'Updating…' : 'Unregister'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bracket-section">
              <div className="bracket-actions">
                <div className="bracket-status">
                  <span>Status: {STATUS_LABEL[tournament.status] ?? tournament.status}</span>
                  <span>Rounds: {bracket?.totalRounds ?? '—'}</span>
                  <span>Matches: {bracket?.totalMatches ?? '—'}</span>
                </div>
                {tournament.status === 'READY' && (
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateBracket}
                    disabled={generateLoading}
                  >
                    {generateLoading ? 'Generating…' : 'Generate Bracket'}
                  </button>
                )}
              </div>

              {bracketMessage.text && (
                <div className={bracketMessage.type === 'success' ? 'alert alert-success' : 'alert alert-error'} role="alert">
                  {bracketMessage.text}
                </div>
              )}

              {bracketError && (
                <div className="alert alert-error" role="alert">
                  {bracketError}
                </div>
              )}

              {bracketLoading ? (
                <LoadingSpinner message="Loading bracket…" />
              ) : bracket ? (
                <TournamentBracket bracket={bracket} onEditScore={setScoreModalMatch} roundLabelFn={getRoundLabel} />
              ) : (
                <div className="bracket-card">
                  <p className="registration-empty">No bracket has been generated yet.</p>
                  {tournament.status !== 'READY' && (
                    <p className="registration-empty">Once this tournament is ready and fully registered, generate the bracket.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {scoreModalMatch && (
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

