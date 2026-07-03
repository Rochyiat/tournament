import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tournamentApi } from '../api/tournament'
import TournamentForm from '../components/TournamentForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { getApiErrorMessage } from '../util/apiError'
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

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // null = create, object = edit
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Fetch ──────────────────────────────────────────────
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

  // ── Create ─────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null)
    setFormError('')
    setShowForm(true)
  }

  // ── Edit ───────────────────────────────────────────────
  function openEdit(t) {
    setEditTarget(t)
    setFormError('')
    setShowForm(true)
  }

  // ── Form submit ────────────────────────────────────────
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

  // ── Delete ─────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────
  return (
    <div>
      <NavBar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Tournaments</h1>
          <button className="btn btn-primary" onClick={openCreate}>+ New Tournament</button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <LoadingSpinner message="Loading tournaments…" />
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No tournaments yet"
            description="Create your first tournament to get started."
            action={{ label: '+ New Tournament', onClick: openCreate }}
          />
        ) : (
          <div className="tournament-grid">
            {tournaments.map((t) => (
              <div key={t.id} className="tournament-card">
                <div className="card-header">
                  <span className={statusClass(t.status)}>{STATUS_LABEL[t.status] ?? t.status}</span>
                  <span className="card-game">{t.game}</span>
                </div>

                <h2 className="card-name">{t.name}</h2>
                <p className="card-host">by {t.host}</p>

                {t.description && (
                  <p className="card-desc">{t.description}</p>
                )}

                <div className="card-meta">
                  <span>👥 Max {t.maxParticipants} participants</span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/tournaments/${t.id}`)}
                  >
                    View
                  </button>
                  {t.status === 'DRAFT' && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(t)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <TournamentForm
          initialData={editTarget}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          serverError={formError}
          loading={formLoading}
        />
      )}

      {/* Delete confirmation */}
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

