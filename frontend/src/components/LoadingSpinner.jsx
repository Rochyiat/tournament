import './LoadingSpinner.css'

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay" role="status" aria-label={message}>
      <div className="spinner" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
