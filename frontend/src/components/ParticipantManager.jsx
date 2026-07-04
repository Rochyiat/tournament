/**
 * ParticipantManager.jsx
 *
 * Dual-panel participant management for tournament registration.
 *
 * LEFT  — Available Participants (not yet registered)
 * RIGHT — Tournament Participants (already registered)
 *
 * Workflow:
 *  1. User checks participants in either panel (multi-select)
 *  2. Staged changes accumulate locally — no API calls yet
 *  3. "Save Changes" shows a confirmation dialog with a summary
 *  4. On confirm, all staged adds/removes are sent to the API sequentially
 *  5. On cancel, staged changes are discarded
 *
 * Props:
 *  availableParticipants  — array  participants not yet in this tournament
 *  registeredParticipants — array  participants already in this tournament
 *  tournament             — object tournament data (used for capacity check)
 *  loading                — bool   show skeleton while data loads
 *  onSave(toAdd, toRemove) — async fn called with arrays of participant IDs after confirm
 *  error                  — string error message to display
 */
import { useState, useMemo } from 'react'
import { Search, X, Users, UserPlus, UserMinus, CheckSquare, Square, Save, AlertTriangle } from 'lucide-react'
import './ParticipantManager.css'

// ── Small helpers ─────────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="pm-search-wrap">
      <Search size={13} strokeWidth={2} className="pm-search-icon" />
      <input
        type="text"
        className="pm-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button className="pm-search-clear" type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

function ParticipantRow({ participant, checked, onToggle, accentColor }) {
  const initial = (participant.participantName || participant.name || '?')[0].toUpperCase()
  const displayName = participant.participantName || participant.name

  return (
    <label className={`pm-row ${checked ? 'pm-row--checked' : ''}`} style={{ '--pm-accent': accentColor }}>
      <input
        type="checkbox"
        className="pm-checkbox"
        checked={checked}
        onChange={() => onToggle(participant)}
        aria-label={`Select ${displayName}`}
      />
      <div className="pm-row-avatar" aria-hidden="true">{initial}</div>
      <span className="pm-row-name">{displayName}</span>
      {checked && <div className="pm-row-check-indicator" aria-hidden="true" />}
    </label>
  )
}

// ── Confirmation Dialog ───────────────────────────────────────────────────────

function ConfirmSaveDialog({ toAdd, toRemove, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box pm-confirm-box" role="dialog" aria-modal="true" aria-labelledby="pm-confirm-title">
        <div className="modal-header">
          <AlertTriangle size={16} strokeWidth={2} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0 }} />
          <h2 id="pm-confirm-title">Confirm Changes</h2>
        </div>
        <div className="modal-body">
          <p className="pm-confirm-intro">You are about to:</p>
          {toAdd.length > 0 && (
            <div className="pm-confirm-item pm-confirm-item--add">
              <UserPlus size={14} strokeWidth={2} />
              <span>Register <strong>{toAdd.length}</strong> participant{toAdd.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {toRemove.length > 0 && (
            <div className="pm-confirm-item pm-confirm-item--remove">
              <UserMinus size={14} strokeWidth={2} />
              <span>Remove <strong>{toRemove.length}</strong> participant{toRemove.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <p className="pm-confirm-note">This will update the tournament roster.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
            <Save size={14} strokeWidth={2} />
            {loading ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ParticipantManager({
  availableParticipants = [],
  registeredParticipants = [],
  tournament,
  loading,
  onSave,
  error,
}) {
  // Search state for each panel
  const [availableQuery, setAvailableQuery] = useState('')
  const [registeredQuery, setRegisteredQuery] = useState('')

  // Staged selections — Sets of participant IDs
  // toAdd: IDs from available panel to register
  // toRemove: IDs from registered panel to unregister
  const [toAdd, setToAdd]       = useState(new Set())
  const [toRemove, setToRemove] = useState(new Set())

  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  // ── Filtered lists ──────────────────────────────────────────────────────
  const filteredAvailable = useMemo(() => {
    const q = availableQuery.trim().toLowerCase()
    return q
      ? availableParticipants.filter((p) => (p.name || '').toLowerCase().includes(q))
      : availableParticipants
  }, [availableParticipants, availableQuery])

  const filteredRegistered = useMemo(() => {
    const q = registeredQuery.trim().toLowerCase()
    return q
      ? registeredParticipants.filter((p) => (p.participantName || '').toLowerCase().includes(q))
      : registeredParticipants
  }, [registeredParticipants, registeredQuery])

  // ── Toggle handlers ─────────────────────────────────────────────────────
  function toggleAdd(participant) {
    setToAdd((prev) => {
      const next = new Set(prev)
      if (next.has(participant.id)) next.delete(participant.id)
      else next.add(participant.id)
      return next
    })
  }

  function toggleRemove(tp) {
    // registered participants have participantId, not id
    const pid = tp.participantId
    setToRemove((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  // ── Select all visible ──────────────────────────────────────────────────
  function selectAllAvailable() {
    setToAdd((prev) => {
      const next = new Set(prev)
      filteredAvailable.forEach((p) => next.add(p.id))
      return next
    })
  }

  function clearAllAvailable() {
    setToAdd((prev) => {
      const next = new Set(prev)
      filteredAvailable.forEach((p) => next.delete(p.id))
      return next
    })
  }

  function selectAllRegistered() {
    setToRemove((prev) => {
      const next = new Set(prev)
      filteredRegistered.forEach((tp) => next.add(tp.participantId))
      return next
    })
  }

  function clearAllRegistered() {
    setToRemove((prev) => {
      const next = new Set(prev)
      filteredRegistered.forEach((tp) => next.delete(tp.participantId))
      return next
    })
  }

  // ── Staging summary ─────────────────────────────────────────────────────
  const hasPendingChanges = toAdd.size > 0 || toRemove.size > 0

  // ── Capacity check ──────────────────────────────────────────────────────
  const currentCount   = registeredParticipants.length
  const maxParticipants = tournament?.maxParticipants ?? 0
  const projectedCount = currentCount + toAdd.size - toRemove.size
  const wouldExceed    = projectedCount > maxParticipants

  // ── Discard ─────────────────────────────────────────────────────────────
  function handleDiscard() {
    setToAdd(new Set())
    setToRemove(new Set())
  }

  // ── Save flow ───────────────────────────────────────────────────────────
  function handleSaveClick() {
    if (!hasPendingChanges) return
    setShowConfirm(true)
  }

  async function handleConfirm() {
    setSaveLoading(true)
    try {
      await onSave([...toAdd], [...toRemove])
      setToAdd(new Set())
      setToRemove(new Set())
      setShowConfirm(false)
    } finally {
      setSaveLoading(false)
    }
  }

  // ── All-selected checks ─────────────────────────────────────────────────
  const allAvailableSelected = filteredAvailable.length > 0 &&
    filteredAvailable.every((p) => toAdd.has(p.id))
  const allRegisteredSelected = filteredRegistered.length > 0 &&
    filteredRegistered.every((tp) => toRemove.has(tp.participantId))

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pm-loading">
        <div className="pm-skeleton pm-skeleton--panel" />
        <div className="pm-skeleton pm-skeleton--panel" />
      </div>
    )
  }

  return (
    <div className="pm-root">
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {/* ── Pending changes banner ── */}
      {hasPendingChanges && (
        <div className="pm-pending-bar">
          <div className="pm-pending-summary">
            <span className="pm-pending-label">Pending Changes</span>
            {toAdd.size > 0 && (
              <span className="pm-pending-add">
                <UserPlus size={12} strokeWidth={2.5} />
                +{toAdd.size} to add
              </span>
            )}
            {toRemove.size > 0 && (
              <span className="pm-pending-remove">
                <UserMinus size={12} strokeWidth={2.5} />
                −{toRemove.size} to remove
              </span>
            )}
            {wouldExceed && (
              <span className="pm-pending-warn">
                <AlertTriangle size={12} strokeWidth={2} />
                Exceeds capacity ({projectedCount}/{maxParticipants})
              </span>
            )}
          </div>
          <div className="pm-pending-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleDiscard}>
              <X size={13} strokeWidth={2.5} />
              Discard
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveClick}
              disabled={wouldExceed}
            >
              <Save size={13} strokeWidth={2} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── Dual panels ── */}
      <div className="pm-panels">

        {/* LEFT — Available */}
        <div className="pm-panel">
          <div className="pm-panel-header">
            <div className="pm-panel-title">
              <Users size={14} strokeWidth={2} />
              Available
              <span className="pm-panel-count">{availableParticipants.length}</span>
            </div>
            {filteredAvailable.length > 0 && (
              <button
                className="pm-select-all-btn"
                type="button"
                onClick={allAvailableSelected ? clearAllAvailable : selectAllAvailable}
              >
                {allAvailableSelected
                  ? <><CheckSquare size={13} strokeWidth={2} /> Deselect all</>
                  : <><Square size={13} strokeWidth={2} /> Select all</>
                }
              </button>
            )}
          </div>

          <SearchInput
            value={availableQuery}
            onChange={setAvailableQuery}
            placeholder="Search participant…"
          />

          <div className="pm-list">
            {filteredAvailable.length === 0 ? (
              <div className="pm-empty">
                {availableParticipants.length === 0
                  ? <><Users size={24} strokeWidth={1} /><p>All participants are already registered.</p></>
                  : <><Search size={24} strokeWidth={1} /><p>No participants match your search.</p></>
                }
              </div>
            ) : (
              filteredAvailable.map((p) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  checked={toAdd.has(p.id)}
                  onToggle={toggleAdd}
                  accentColor="var(--primary)"
                />
              ))
            )}
          </div>
        </div>

        {/* Divider arrow */}
        <div className="pm-divider" aria-hidden="true">
          <div className="pm-divider-line" />
          <div className="pm-divider-icon">
            <UserPlus size={16} strokeWidth={1.5} />
            <UserMinus size={16} strokeWidth={1.5} />
          </div>
          <div className="pm-divider-line" />
        </div>

        {/* RIGHT — Registered */}
        <div className="pm-panel">
          <div className="pm-panel-header">
            <div className="pm-panel-title">
              <UserPlus size={14} strokeWidth={2} />
              Registered
              <span className="pm-panel-count pm-panel-count--registered">
                {registeredParticipants.length} / {maxParticipants}
              </span>
            </div>
            {filteredRegistered.length > 0 && (
              <button
                className="pm-select-all-btn pm-select-all-btn--remove"
                type="button"
                onClick={allRegisteredSelected ? clearAllRegistered : selectAllRegistered}
              >
                {allRegisteredSelected
                  ? <><CheckSquare size={13} strokeWidth={2} /> Deselect all</>
                  : <><Square size={13} strokeWidth={2} /> Select all</>
                }
              </button>
            )}
          </div>

          <SearchInput
            value={registeredQuery}
            onChange={setRegisteredQuery}
            placeholder="Search participant…"
          />

          <div className="pm-list">
            {filteredRegistered.length === 0 ? (
              <div className="pm-empty">
                {registeredParticipants.length === 0
                  ? <><Users size={24} strokeWidth={1} /><p>No participants registered yet.</p></>
                  : <><Search size={24} strokeWidth={1} /><p>No participants match your search.</p></>
                }
              </div>
            ) : (
              filteredRegistered.map((tp) => (
                <ParticipantRow
                  key={tp.id}
                  participant={{ ...tp, id: tp.participantId, name: tp.participantName }}
                  checked={toRemove.has(tp.participantId)}
                  onToggle={() => toggleRemove(tp)}
                  accentColor="var(--danger)"
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmSaveDialog
          toAdd={[...toAdd]}
          toRemove={[...toRemove]}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={saveLoading}
        />
      )}
    </div>
  )
}
