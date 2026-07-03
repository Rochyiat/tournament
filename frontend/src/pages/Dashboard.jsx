import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { dashboardApi } from '../api/dashboard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { getApiErrorMessage } from '../util/apiError'
import './Dashboard.css'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSummary() {
      setLoading(true)
      setError('')
      try {
        const res = await dashboardApi.getSummary()
        setSummary(res.data.data)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load dashboard data.'))
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [])

  return (
    <div>
      <NavBar />
      <div className="dashboard-container">
        <main className="dashboard-main">
          {error && <div className="alert alert-error dashboard-error">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Loading dashboard…" />
          ) : summary ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Tournaments</h3>
                  <p>{summary.totalTournaments}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Participants</h3>
                  <p>{summary.totalParticipants}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Matches</h3>
                  <p>{summary.totalMatches}</p>
                </div>
              </div>

              <div className="dashboard-card">
                <h3>Tournament Status Summary</h3>
                <div className="status-summary">
                  <div className="status-card">
                    <h4>Draft</h4>
                    <p>{summary.statusSummary?.draft ?? 0}</p>
                  </div>
                  <div className="status-card">
                    <h4>Ready</h4>
                    <p>{summary.statusSummary?.ready ?? 0}</p>
                  </div>
                  <div className="status-card">
                    <h4>Ongoing</h4>
                    <p>{summary.statusSummary?.ongoing ?? 0}</p>
                  </div>
                  <div className="status-card">
                    <h4>Finished</h4>
                    <p>{summary.statusSummary?.finished ?? 0}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon="📊"
              title="Dashboard data unavailable"
              description="The dashboard summary could not be loaded at this time."
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard

