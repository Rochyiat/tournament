import { useState, useEffect } from 'react'
import { X, Trophy, Save, Plus } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  game: '',
  host: '',
  maxParticipants: '',
  description: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim())          errors.name = 'Tournament name is required'
  if (!form.game.trim())          errors.game = 'Game is required'
  if (!form.host.trim())          errors.host = 'Host is required'
  const max = Number(form.maxParticipants)
  if (!form.maxParticipants)      errors.maxParticipants = 'Max participants is required'
  else if (isNaN(max) || max < 2) errors.maxParticipants = 'Must be at least 2'
  return errors
}

/**
 * TournamentForm — reusable modal form for create & edit.
 * Props:
 *  - initialData: tournament object (edit mode) or null (create mode)
 *  - onSubmit(formData): async callback
 *  - onCancel: callback
 *  - serverError: string from API
 *  - loading: bool
 */
function TournamentForm({ initialData, onSubmit, onCancel, serverError, loading }) {
  const isEdit = !!initialData

  const [form, setForm] = useState(
    initialData
      ? {
          name: initialData.name || '',
          game: initialData.game || '',
          host: initialData.host || '',
          maxParticipants: initialData.maxParticipants ?? '',
          description: initialData.description || '',
        }
      : { ...EMPTY_FORM }
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        game: initialData.game || '',
        host: initialData.host || '',
        maxParticipants: initialData.maxParticipants ?? '',
        description: initialData.description || '',
      })
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
    await onSubmit({
      name: form.name.trim(),
      game: form.game.trim(),
      host: form.host.trim(),
      maxParticipants: Number(form.maxParticipants),
      description: form.description.trim() || null,
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="form-title">

        <div className="modal-header">
          <Trophy size={16} strokeWidth={2} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <h2 id="form-title">{isEdit ? 'Edit Tournament' : 'Create Tournament'}</h2>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close dialog">
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError && (
              <div className="alert alert-error" role="alert">{serverError}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-name">Tournament Name <span aria-hidden="true">*</span></label>
                <input
                  id="f-name" name="name" value={form.name}
                  onChange={handleChange} placeholder="e.g. ESL Cup 2026"
                  className={errors.name ? 'input-error' : ''}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="f-game">Game <span aria-hidden="true">*</span></label>
                <input
                  id="f-game" name="game" value={form.game}
                  onChange={handleChange} placeholder="e.g. Valorant"
                  className={errors.game ? 'input-error' : ''}
                  aria-invalid={!!errors.game}
                />
                {errors.game && <span className="field-error" role="alert">{errors.game}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-host">Host <span aria-hidden="true">*</span></label>
                <input
                  id="f-host" name="host" value={form.host}
                  onChange={handleChange} placeholder="e.g. ESL Gaming"
                  className={errors.host ? 'input-error' : ''}
                  aria-invalid={!!errors.host}
                />
                {errors.host && <span className="field-error" role="alert">{errors.host}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="f-max">Max Participants <span aria-hidden="true">*</span></label>
                <input
                  id="f-max" name="maxParticipants" type="number"
                  min="2" value={form.maxParticipants}
                  onChange={handleChange} placeholder="e.g. 8"
                  className={errors.maxParticipants ? 'input-error' : ''}
                  aria-invalid={!!errors.maxParticipants}
                />
                {errors.maxParticipants && (
                  <span className="field-error" role="alert">{errors.maxParticipants}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="f-desc">Description</label>
              <textarea
                id="f-desc" name="description" value={form.description}
                onChange={handleChange} placeholder="Optional tournament description…"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {isEdit
                ? <><Save size={14} strokeWidth={2} />{loading ? 'Saving…' : 'Save Changes'}</>
                : <><Plus size={14} strokeWidth={2.5} />{loading ? 'Creating…' : 'Create Tournament'}</>
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default TournamentForm
