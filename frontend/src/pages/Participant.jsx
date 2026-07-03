import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { participantApi } from '../api/participant'
import ParticipantForm from '../components/ParticipantForm'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import NavBar from '../components/NavBar'
import { getApiErrorMessage } from '../util/apiError'
import './Participant.css'

function Participant() {
  const navigate = useNavigate()

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

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

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
        <div className="participant-header">
          <div>
            <h1 className="page-title">Participants</h1>
            <p>Manage participants for tournament registration.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Participant</button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <LoadingSpinner message="Loading participants…" />
        ) : participants.length === 0 ? (
          <EmptyState
            icon="🧑‍🤝‍🧑"
            title="No participants yet"
            description="Create participants and then register them for tournaments."
            action={{ label: '+ New Participant', onClick: openCreate }}
          />
        ) : (
          <div className="participant-card">
            <table className="participant-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.name}</td>
                    <td>
                      <div className="participant-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(participant)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(participant)}>
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
