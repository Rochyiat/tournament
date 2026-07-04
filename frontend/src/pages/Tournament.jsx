import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tournamentApi } from '../api/tournament'
import TournamentForm from '../components/TournamentForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import EmptyState from '../components/EmptyState'
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { useAuth } from '../context/AuthContext'
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
  Globe,
  UserCircle2,
  UserCircle,
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

// ── Organizer tag — shown on every card ──────────────────────────────────────
function OrganizerTag({ ownerUsername, isYou }) {
  return (
    <div className="trn-organizer-tag">
      <UserCircle size={12} strokeWidth={2} />
      <span className="trn-organizer-name">{ownerUsername ?? '—'}</span>
      {isYou && <span className="trn-organizer-you">You</span>}
    </div>
  )
}

// ── Shared card for My Tournaments (with edit/delete) ────────────────────────
function MyTournamentCard({ t, onView, onEdit, onDelete }) {
  return (
    <div className="tournament-card" onClick={() => onView(t.id)}>
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

        {/* Organizer — always "You" in My Tournaments */}
        <OrganizerTag ownerUsername={t.ownerUsername} isYou />

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
          <button className="btn btn-secondary btn-sm" onClick={() => onView(t.id)}>
            <Eye size={13} strokeWidth={2} />
            View
          </button>
          {t.status === 'DRAFT' && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(t)}>
                <Pencil size={13} strokeWidth={2} />
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(t)}>
                <Trash2 size={13} strokeWidth={2} />
                Delete
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Read-only card for Community Tournaments ─────────────────────────────────
function CommunityTournamentCard({ t, onView }) {
  return (
    <div className="tournament-card tournament-card--community" onClick={() => onView(t.id)}>
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

        {/* Organizer — never "You" in Community Tournaments */}
        <OrganizerTag ownerUsername={t.ownerUsername} isYou={false} />

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

        {/* View only — no edit/delete/generate/score controls */}
        <div className="tournament-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-secondary btn-sm" onClick={() => onView(t.id)}>
            <Eye size={13} strokeWidth={2} />
            View
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, count, accent, action }) {
  return (
    <div className="trn-section-heading">
      <div className="trn-section-heading-left">
        <div className="trn-section-heading-icon" style={{ '--sh-accent': accent }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <h2 className="trn-section-title">{title}</h2>
        {count !== undefined && (
          <span className="trn-section-count">{count}</span>
        )}
      </div>
      {action && (
        <button className="btn btn-primary btn-sm" onClick={action.onClick}>
          <Plus size={14} strokeWidth={2.5} />
          {action.label}
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Tournament() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // My tournaments
  const [myTournaments, setMyTournaments]   = useState([])
  const [myLoading, setMyLoading]           = useState(true)
  const [myError, setMyError]               = useState('')

  // All tournaments (used to derive community)
  const [allTournaments, setAllTournaments] = useState([])
  const [allLoading, setAllLoading]         = useState(true)
  const [allError, setAllError]             = useState('')

  // Form / delete modals
  const [showForm, setShowForm]             = useState(false)
  const [editTarget, setEditTarget]         = useState(null)
  const [formLoading, setFormLoading]       = useState(false)
  const [formError, setFormError]           = useState('')
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleteLoading, setDeleteLoading]   = useState(false)

  // ── Fetch my tournaments ──────────────────────────────────────────────────
  const fetchMy = useCallback(async () => {
    setMyLoading(true)
    setMyError('')
    try {
      const res = await tournamentApi.getMy()
      setMyTournaments(res.data.data ?? [])
    } catch (err) {
      setMyError(getApiErrorMessage(err, 'Failed to load your tournaments.'))
    } finally {
      setMyLoading(false)
    }
  }, [])

  // ── Fetch all tournaments (for community section) ─────────────────────────
  const fetchAll = useCallback(async () => {
    setAllLoading(true)
    setAllError('')
    try {
      const res = await tournamentApi.getAll()
      setAllTournaments(res.data.data ?? [])
    } catch (err) {
      setAllError(getApiErrorMessage(err, 'Failed to load community tournaments.'))
    } finally {
      setAllLoading(false)
    }
  }, [])

  useEffect(() => { fetchMy(); fetchAll() }, [fetchMy, fetchAll])

  // Community = all tournaments NOT owned by current user
  const communityTournaments = allTournaments.filter(
    (t) => t.ownerId !== currentUser?.id && t.ownerUsername !== currentUser?.username
  )

  // ── Form handlers ────────────────────────────────────────────────────────
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
      fetchMy()
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
      fetchMy()
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tournament.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <NavBar />
      <div className="page-container">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Tournaments</h1>
            <p className="page-subtitle">Manage your tournaments and explore the community</p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            SECTION 1 — My Tournaments
        ════════════════════════════════════════════════ */}
        <section className="trn-section">
          <SectionHeading
            icon={UserCircle2}
            title="My Tournaments"
            count={myLoading ? undefined : myTournaments.length}
            accent="var(--primary)"
            action={{ label: 'Create Tournament', onClick: openCreate }}
          />

          {myError && <div className="alert alert-error" role="alert">{myError}</div>}

          {myLoading ? (
            <div className="tournament-grid">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : myTournaments.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="You haven't created any tournaments yet."
              description="Create your first tournament and start organizing your community."
              action={{ label: 'Create Tournament', onClick: openCreate }}
            />
          ) : (
            <div className="tournament-grid">
              {myTournaments.map((t) => (
                <MyTournamentCard
                  key={t.id}
                  t={t}
                  onView={(tid) => navigate(`/tournaments/${tid}`)}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════
            SECTION 2 — Community Tournaments
        ════════════════════════════════════════════════ */}
        <section className="trn-section">
          <SectionHeading
            icon={Globe}
            title="Community Tournaments"
            count={allLoading ? undefined : communityTournaments.length}
            accent="#a78bfa"
          />

          {allError && <div className="alert alert-error" role="alert">{allError}</div>}

          {allLoading ? (
            <div className="tournament-grid">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : communityTournaments.length === 0 ? (
            <div className="trn-community-empty">
              <Globe size={28} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
              <p>No community tournaments yet.</p>
              <p className="page-subtitle">Tournaments created by other organizers will appear here.</p>
            </div>
          ) : (
            <div className="tournament-grid">
              {communityTournaments.map((t) => (
                <CommunityTournamentCard
                  key={t.id}
                  t={t}
                  onView={(tid) => navigate(`/tournaments/${tid}`)}
                />
              ))}
            </div>
          )}
        </section>

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
