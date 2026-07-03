import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { dashboardApi } from '../api/dashboard'
import LoadingSpinner, { SkeletonStatGrid } from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { getApiErrorMessage } from '../util/apiError'
import {
  Trophy,
  Users,
  Swords,
  Crown,
  FileEdit,
  CheckCircle2,
  Activity,
  Flag,
  BarChart3,
} from 'lucide-react'
import './Dashboard.css'

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-card-icon">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value ?? 0}</span>
        {sub && <span className="stat-card-sub">{sub}</span>}
      </div>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, color }) {
  return (
    <div className="status-item" style={{ '--sc': color }}>
      <div className="status-item-icon">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="status-item-info">
        <span className="status-item-label">{label}</span>
        <span className="status-item-value">{value ?? 0}</span>
      </div>
    </div>
  )
}

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
      <div className="page-container">

        {/* Page header */}
        <div className="page-header dashboard-page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="dashboard-subtitle">Platform overview &amp; live statistics</p>
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        {loading ? (
          <>
            <SkeletonStatGrid count={4} />
            <SkeletonStatGrid count={4} />
          </>
        ) : summary ? (
          <>
            {/* Primary stats */}
            <div className="stats-grid">
              <StatCard
                icon={Trophy}
                label="Total Tournaments"
                value={summary.totalTournaments}
                accent="var(--primary)"
              />
              <StatCard
                icon={Users}
                label="Total Participants"
                value={summary.totalParticipants}
                accent="#a78bfa"
              />
              <StatCard
                icon={Swords}
                label="Total Matches"
                value={summary.totalMatches}
                accent="#f59e0b"
              />
              <StatCard
                icon={Crown}
                label="Finished Tournaments"
                value={summary.statusSummary?.finished ?? 0}
                accent="#4ade80"
              />
            </div>

            {/* Status breakdown */}
            <div className="section-card">
              <div className="section-card-header">
                <h3><BarChart3 size={15} /> Tournament Status Breakdown</h3>
              </div>
              <div className="section-card-body">
                <div className="status-grid">
                  <StatusCard icon={FileEdit}    label="Draft"   value={summary.statusSummary?.draft    ?? 0} color="#94a3b8" />
                  <StatusCard icon={CheckCircle2} label="Ready"   value={summary.statusSummary?.ready   ?? 0} color="var(--primary)" />
                  <StatusCard icon={Activity}     label="Ongoing" value={summary.statusSummary?.ongoing ?? 0} color="var(--success)" />
                  <StatusCard icon={Flag}         label="Finished" value={summary.statusSummary?.finished ?? 0} color="#a5b4fc" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Dashboard data unavailable"
            description="The dashboard summary could not be loaded at this time."
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
