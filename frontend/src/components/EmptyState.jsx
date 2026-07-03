import './EmptyState.css'

function EmptyState({ icon: Icon, title = 'No data found', description = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap" aria-hidden="true">
        {Icon && <Icon size={36} strokeWidth={1.5} />}
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
