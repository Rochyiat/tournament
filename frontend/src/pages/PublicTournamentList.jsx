import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Gamepad2, Users, Calendar,
  ChevronRight, Search, Filter,
} from 'lucide-react'
import PublicNavBar from '../components/PublicNavBar'
import { publicTournamentApi } from '../api/publicApi'
import './PublicTournamentList.css'

const STATUS_LABEL  = { DRAFT: 'Draft', READY: 'Ready', ONGOING: 'Ongoing', FINISHED: 'Finished' }
const STATUS_ORDER  = { ONGOING: 0, READY: 1, DRAFT: 2, FINISHED: 3 }

function getGameColor(game = '') {
  const g = game.toLowerCase()
  if (g.includes('valorant'))         return '#ff4655'
  if (g.includes('mobile legends') || g.includes('ml')) return '#00b0ff'
  if (g.includes('dota'))             return '#c23b22'
  if (g.includes('cs') || g.includes('counter')) return '#f5a623'
  if (g.includes('pubg'))             return '#f0a500'
  if (g.includes('league'))           return '#c89b3c'
  return 'var(--primary)'
}

const FILTERS = ['All', 'Ongoing', 'Ready', 'Finished', 'Draft']

export default function PublicTournamentList() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('All')

  useEffect(() => {
    publicTournamentApi.getAll()
      .then(r => setTournaments(r.data.data ?? []))
      .catch(() => setError('Could not load tournaments. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = tournaments
    .filter(t => filter === 'All' || t.status === filter.toUpperCase())
    .filter(t =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.game.toLowerCase().includes(search.toLowerCase()) ||
      t.host.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9))

  return (
    <div className="pub-page">
      <PublicNavBar />

      <div className="pub-page-inner">

        {/* Header */}
        <div className="pub-page-header">
          <div>
            <div className="pub-section-label">
              <Trophy size={13} strokeWidth={2} />
              Browse Tournaments
            </div>
            <h1 className="pub-page-title">All Tournaments</h1>
            <p className="pub-page-subtitle">
              {loading ? '…' : `${tournaments.length} tournament${tournaments.length !== 1 ? 's' : ''} on Nakata Arena`}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="pub-toolbar">
          <div className="pub-search-wrap">
            <Search size={15} strokeWidth={2} className="pub-search-icon" />
            <input
              type="search"
              className="pub-search"
              placeholder="Search by name, game, or host…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search tournaments"
            />
          </div>
          <div className="pub-filters" role="group" aria-label="Filter by status">
            <Filter size={14} strokeWidth={2} className="pub-filter-icon" />
            {FILTERS.map(f => (
              <button
                key={f}
                className={'pub-filter-btn' + (filter === f ? ' active' : '')}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="pub-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-title" style={{ width: '55%' }} />
                <div className="skeleton skeleton-text"  style={{ width: '35%' }} />
                <div className="skeleton skeleton-text"  style={{ width: '75%' }} />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="pub-empty">
            <Trophy size={36} strokeWidth={1} />
            <h3>No tournaments found</h3>
            <p>
              {search || filter !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'No tournaments have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="pub-grid">
            {visible.map(t => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="pub-tcard"
                style={{ '--game-color': getGameColor(t.game) }}
              >
                <div className="pub-tcard-stripe" />
                <div className="pub-tcard-inner">
                  <div className="pub-tcard-head">
                    <span className={`badge badge-${t.status?.toLowerCase()}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    <span className="pub-tcard-game">
                      <Gamepad2 size={11} strokeWidth={2} />
                      {t.game}
                    </span>
                  </div>
                  <h2 className="pub-tcard-name">{t.name}</h2>
                  <p className="pub-tcard-host">by {t.host}</p>
                  {t.description && (
                    <p className="pub-tcard-desc">{t.description}</p>
                  )}
                  <div className="pub-tcard-foot">
                    <span className="pub-tcard-meta">
                      <Users size={12} strokeWidth={2} />
                      {t.maxParticipants} slots
                    </span>
                    {t.createdAt && (
                      <span className="pub-tcard-meta">
                        <Calendar size={12} strokeWidth={2} />
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="pub-tcard-cta">
                      View <ChevronRight size={13} strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
