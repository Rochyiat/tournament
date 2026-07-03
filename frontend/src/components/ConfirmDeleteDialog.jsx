import './ConfirmDeleteDialog.css'

function ConfirmDeleteDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box">
        <div className="dialog-icon" aria-hidden="true">🗑️</div>
        <h2 id="dialog-title" className="dialog-title">{title || 'Confirm Delete'}</h2>
        <p className="dialog-message">{message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteDialog
