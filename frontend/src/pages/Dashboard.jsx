import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import TournamentForm from '../components/TournamentForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import LoadingSpinner, { SkeletonStatGrid } from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { tournamentApi } from '../api/tournament'
import { getApiErrorMessage } from '../util/apiError'
import {
  Trophy,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Activity,
  Flag,
  FileEdit,
  Gamepad2,
  Users,
  Calendar,
  Zap,
} from 'lucide-react'
import './Dashboard.css'

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-card-icon">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value ?? 0}</span>
      </div>
    </div>
  )
}

const STATUS_LABEL = { DRAFT: 'Draft', READY: 'Ready', ONGOING: 'Ongoing', FINISHED: 'Finished' }

function statusClass(status) {
  return `badge badge-${status?.toLowerCase()}`
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [tournaments, setTournaments]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [formError, setFormError]       = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Fetch my tournaments ────────────────────────────────────────────────────
  const fetchMyTournaments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tournamentApi.getMy()
      setTournaments(res.data.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load your tournaments.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMyTournaments() }, [fetchMyTournaments])

  // ── Derived stats ───────────────────────────────────────────────────────────
  const total    = tournaments.length
  const active   = tournaments.filter(t => t.status === 'ONGOING' || t.status === 'READY').length
  const finished = tournaments.filter(t => t.status === 'FINISHED').length

  // ── Form handlers ───────────────────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(t) {
    setEditTarget(t)
    setFormError('')
    setShowForm(true)
  }

  async function handleFormSubmit(data) {
    setFormLoading(true)
    setFormError('')
    try {
      if (editTarget) {
        await tournamentApi.update(editTarget.id, data)
      } else {
        await tournamentApi.create(data)
      }
      setShowForm(false)
      fetchMyTournaments()
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : getApiErrorMessage(err, 'An error occurred. Please try again.')
      setFormError(msg)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await tournamentApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchMyTournaments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tournament.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <NavBar />
      <div className="page-container">

        {/* ── Page header ── */}
        <div className="page-header dashboard-page-header">
          <div>
            <h1 className="page-title">
              <Zap size={22} strokeWidth={2} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: '0.4rem' }} />
              Welcome back, {currentUser?.username ?? 'Organizer'}
            </h1>
            <p className="dashboard-subtitle">My Tournaments — manage everything you own</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} strokeWidth={2.5} />
            Create Tournament
          </button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {/* ── Stats ── */}
        {loading ? (
          <SkeletonStatGrid count={3} />
        ) : (
          <div className="stats-grid">
            <StatCard icon={Trophy}   label="My Tournaments" value={total}    accent="var(--primary)" />
            <StatCard icon={Activity} label="Active"         value={active}   accent="var(--success)" />
            <StatCard icon={Flag}     label="Finished"       value={finished} accent="#a78bfa" />
          </div>
        )}

        {/* ── Tournament list ── */}
        <div className="section-card">
          <div className="section-card-header">
            <h3><Trophy size={15} /> My Tournaments</h3>
          </div>
          <div className="section-card-body">
            {loading ? (
              <LoadingSpinner message="Loading tournaments…" />
            ) : tournaments.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="No tournaments yet"
                description="Create your first tournament to get started."
                action={{ label: 'Create Tournament', onClick: openCreate }}
              />
            ) : (
              <div className="tournament-grid">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="tournament-card"
                    onClick={() => navigate(`/tournaments/${t.id}`)}
                  >
                    <div className={`tournament-card-stripe tournament-card-stripe--${t.status?.toLowerCase()}`} />
                    <div className="tournament-card-inner">

                      <div className="tournament-card-header">
                        <span className={statusClass(t.status)}>{STATUS_LABEL[t.status] ?? t.status}</span>
                        <span className="tournament-card-game">
                          <Gamepad2 size={12} strokeWidth={2} />
                          {t.game}
                        </span>
                      </div>

                      <h2 className="tournament-card-name">{t.name}</h2>
                      <p className="tournament-card-host">by {t.host}</p>

                      {t.description && (
                        <p className="tournament-card-desc">{t.description}</p>
                      )}

                      <div className="tournament-card-meta">
                        <span className="tournament-card-meta-item">
                          <Users size={13} strokeWidth={2} />
                          {t.maxParticipants} slots
                        </span>
                        {t.createdAt && (
                          <span className="tournament-card-meta-item">
                            <Calendar size={13} strokeWidth={2} />
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="tournament-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/tournaments/${t.id}`)}
                        >
                          <Eye size={13} strokeWidth={2} />
                          View
                        </button>
                        {t.status === 'DRAFT' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>
                              <Pencil size={13} strokeWidth={2} />
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(t)}>
                              <Trash2 size={13} strokeWidth={2} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      {showForm && (
        <TournamentForm
          initialData={editTarget}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          serverError={formError}
          loading={formLoading}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title="Delete Tournament"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
