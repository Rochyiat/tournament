import './LoadingSpinner.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" style={{ width: '40%' }} />
      <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '28px', borderRadius: '8px' }} />
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '28px', borderRadius: '8px' }} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table-wrap">
      <div className="skeleton-table-header">
        <div className="skeleton skeleton-text" style={{ width: '30%' }} />
        <div className="skeleton skeleton-text" style={{ width: '15%' }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton skeleton-text" style={{ width: `${50 + (i % 3) * 10}%` }} />
          <div className="skeleton skeleton-text" style={{ width: '120px', height: '28px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="skeleton-stat-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ padding: '1.5rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton skeleton-title" style={{ width: '50%', marginTop: '0.75rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '35%' }} />
        </div>
      ))}
    </div>
  )
}

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay" role="status" aria-label={message}>
      <div className="spinner-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
