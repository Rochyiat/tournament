import { useState, useEffect, useCallback } from 'react'
import { participantApi } from '../api/participant'
import ParticipantForm from '../components/ParticipantForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import EmptyState from '../components/EmptyState'
import LoadingSpinner, { SkeletonTable } from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { getApiErrorMessage } from '../util/apiError'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import './Participant.css'

function Participant() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchParticipants = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await participantApi.getAll()
      setParticipants(res.data.data ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load participants'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchParticipants() }, [fetchParticipants])

  function openCreate() {
    setEditTarget(null)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(participant) {
    setEditTarget(participant)
    setFormError('')
    setShowForm(true)
  }

  async function handleFormSubmit(data) {
    setFormLoading(true)
    setFormError('')
    try {
      if (editTarget) {
        await participantApi.update(editTarget.id, data)
      } else {
        await participantApi.create(data)
      }
      setShowForm(false)
      fetchParticipants()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save participant.'))
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await participantApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchParticipants()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete participant')
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
            <h1 className="page-title">Participants</h1>
            <p className="participant-subtitle">
              Global registry — {loading ? '…' : participants.length} player{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} strokeWidth={2.5} />
            New Participant
          </button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <SkeletonTable rows={6} />
        ) : participants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No participants yet"
            description="Create participants here, then register them into tournaments."
            action={{ label: 'New Participant', onClick: openCreate }}
          />
        ) : (
          <div className="participant-card">
            <div className="participant-card-header">
              <div className="participant-card-title">
                <Users size={15} strokeWidth={2} />
                All Participants
              </div>
              <span className="participant-card-count">{participants.length} total</span>
            </div>
            <table className="participant-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>#</th>
                  <th>Name</th>
                  <th style={{ width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, idx) => (
                  <tr key={participant.id}>
                    <td className="participant-num">{idx + 1}</td>
                    <td className="participant-name">
                      <div className="participant-avatar" aria-hidden="true">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      {participant.name}
                    </td>
                    <td>
                      <div className="participant-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(participant)}
                          aria-label={`Edit ${participant.name}`}
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(participant)}
                          aria-label={`Delete ${participant.name}`}
                        >
                          <Trash2 size={13} strokeWidth={2} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ParticipantForm
          initialData={editTarget}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          serverError={formError}
          loading={formLoading}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title="Delete Participant"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

export default Participant
