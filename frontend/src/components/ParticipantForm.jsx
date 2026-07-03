import { useState, useEffect } from 'react'
import { X, Users, Save, Plus } from 'lucide-react'

const EMPTY_FORM = { name: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Participant name is required'
  else if (form.name.trim().length > 100) errors.name = 'Name must be 100 characters or less'
  return errors
}

function ParticipantForm({ initialData, onSubmit, onCancel, serverError, loading }) {
  const isEdit = !!initialData
  const [form, setForm] = useState(initialData ? { name: initialData.name || '' } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name || '' })
    } else {
      setForm({ ...EMPTY_FORM })
    }
    setErrors({})
  }, [initialData?.id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    await onSubmit({ name: form.name.trim() })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="participant-form-title">

        <div className="modal-header">
          <Users size={16} strokeWidth={2} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <h2 id="participant-form-title">{isEdit ? 'Edit Participant' : 'Add Participant'}</h2>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close dialog">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError && (
              <div className="alert alert-error" role="alert">{serverError}</div>
            )}
            <div className="form-group">
              <label htmlFor="participant-name">Name <span aria-hidden="true">*</span></label>
              <input
                id="participant-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter participant name"
                className={errors.name ? 'input-error' : ''}
                aria-invalid={!!errors.name}
                autoFocus
              />
              {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {isEdit
                ? <><Save size={14} strokeWidth={2} />{loading ? 'Saving…' : 'Save Changes'}</>
                : <><Plus size={14} strokeWidth={2.5} />{loading ? 'Adding…' : 'Add Participant'}</>
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default ParticipantForm
