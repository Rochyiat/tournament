import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tournamentApi } from '../api/tournament'
import TournamentForm from '../components/TournamentForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import EmptyState from '../components/EmptyState'
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { getApiErrorMessage } from '../util/apiError'
import {
  Trophy,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  Gamepad2,
  Calendar,
} from 'lucide-react'
import './Tournament.css'

const STATUS_LABEL = {
  DRAFT: 'Draft',
  READY: 'Ready',
  ONGOING: 'Ongoing',
  FINISHED: 'Finished',
}

function statusClass(status) {
  return `badge badge-${status?.toLowerCase()}`
}

function Tournament() {
  const navigate = useNavigate()

  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTournaments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tournamentApi.getAll()
      setTournaments(res.data.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load tournaments'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTournaments() }, [fetchTournaments])

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
      fetchTournaments()
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors || {}).join(', ')
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
      fetchTournaments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tournament')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <NavBar />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tournaments</h1>
            <p className="page-subtitle">Manage and track all esports tournaments</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} strokeWidth={2.5} />
            New Tournament
          </button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <div className="tournament-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No tournaments yet"
            description="Create your first tournament to get started."
            action={{ label: 'New Tournament', onClick: openCreate }}
          />
        ) : (
          <div className="tournament-grid">
            {tournaments.map((t) => (
              <div key={t.id} className="tournament-card" onClick={() => navigate(`/tournaments/${t.id}`)}>

                {/* Card top stripe by status */}
                <div className={`tournament-card-stripe tournament-card-stripe--${t.status?.toLowerCase()}`} />

                <div className="tournament-card-inner">
                  {/* Header row */}
                  <div className="tournament-card-header">
                    <span className={statusClass(t.status)}>{STATUS_LABEL[t.status] ?? t.status}</span>
                    <span className="tournament-card-game">
                      <Gamepad2 size={12} strokeWidth={2} />
                      {t.game}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="tournament-card-name">{t.name}</h2>
                  <p className="tournament-card-host">by {t.host}</p>

                  {t.description && (
                    <p className="tournament-card-desc">{t.description}</p>
                  )}

                  {/* Meta */}
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

                  {/* Actions */}
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

export default Tournament
