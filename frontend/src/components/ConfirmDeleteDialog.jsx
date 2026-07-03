import { Trash2, AlertTriangle } from 'lucide-react'
import './ConfirmDeleteDialog.css'

function ConfirmDeleteDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box">
        <div className="dialog-icon-wrap" aria-hidden="true">
          <AlertTriangle size={28} strokeWidth={1.5} />
        </div>
        <h2 id="dialog-title" className="dialog-title">{title || 'Confirm Delete'}</h2>
        <p className="dialog-message">{message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            <Trash2 size={14} strokeWidth={2} />
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteDialog
