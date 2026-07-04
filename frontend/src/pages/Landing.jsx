import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Users, GitBranch, Zap, Shield, Monitor,
  ArrowRight, Gamepad2, Crown, ChevronRight,
} from 'lucide-react'
import PublicNavBar from '../components/PublicNavBar'
import { publicTournamentApi } from '../api/publicApi'
import './Landing.css'

const STATUS_LABEL = { DRAFT: 'Draft', READY: 'Ready', ONGOING: 'Ongoing', FINISHED: 'Finished' }

const FEATURES = [
  { icon: Trophy,     title: 'Tournament Management',       desc: 'Create and manage tournaments from draft to champion in minutes.' },
  { icon: Users,      title: 'Participant Registration',    desc: 'Register players globally and manage rosters per tournament.' },
  { icon: GitBranch,  title: 'Automatic Bracket',          desc: 'Single-elimination brackets generated instantly and fairly.' },
  { icon: Zap,        title: 'Live Progress',              desc: 'Score updates propagate in real time across all rounds.' },
  { icon: Crown,      title: 'Champion Tracking',          desc: 'Winner is crowned automatically when the final match ends.' },
  { icon: Monitor,    title: 'Responsive Design',          desc: 'Optimised for desktop, tablet, and mobile.' },
]

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

export default function Landing() {
  const [tournaments, setTournaments] = useState([])
  const [loadingT, setLoadingT] = useState(true)

  useEffect(() => {
    publicTournamentApi.getAll()
      .then(r => setTournaments(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingT(false))
  }, [])

  const featured = tournaments.find(t => t.status === 'ONGOING') ||
                   tournaments.find(t => t.status === 'READY')   ||
                   tournaments[0]
  const latest = tournaments.slice(0, 6)

  return (
    <div className="landing">
      <PublicNavBar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg-glow hero-bg-glow--1" />
          <div className="hero-bg-glow hero-bg-glow--2" />
          <div className="hero-bg-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <Zap size={13} strokeWidth={2.5} />
            <span>Professional Esports Platform</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">Compete.</span>
            <span className="hero-title-line hero-title-line--accent">Organize.</span>
            <span className="hero-title-line">Become Champion.</span>
          </h1>

          <p className="hero-subtitle">
            Manage tournaments, participants, and brackets with a modern esports platform built for serious organizers.
          </p>

          <div className="hero-actions">
            <Link to="/tournaments" className="btn btn-primary hero-btn-primary">
              <Trophy size={16} strokeWidth={2} />
              View Tournaments
            </Link>
            <Link to="/login" className="btn btn-secondary hero-btn-secondary">
              Organizer Login
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{tournaments.length}</span>
              <span className="hero-stat-label">Tournaments</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">
                {tournaments.filter(t => t.status === 'ONGOING').length}
              </span>
              <span className="hero-stat-label">Live Now</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">
                {tournaments.filter(t => t.status === 'FINISHED').length}
              </span>
              <span className="hero-stat-label">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED TOURNAMENT ───────────────────────────────────── */}
      {featured && (
        <section className="pub-section" aria-label="Featured Tournament">
          <div className="pub-section-inner">
            <div className="pub-section-label">
              <Shield size={14} strokeWidth={2} />
              Featured Tournament
            </div>
            <div
              className="featured-card"
              style={{ '--game-color': getGameColor(featured.game) }}
            >
              <div className="featured-card-stripe" />
              <div className="featured-card-body">
                <div className="featured-card-left">
                  <div className="featured-card-game-icon">
                    <Gamepad2 size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="featured-card-meta">
                      <span className={`badge badge-${featured.status?.toLowerCase()}`}>
                        {STATUS_LABEL[featured.status] ?? featured.status}
                      </span>
                      <span className="featured-card-game-label">{featured.game}</span>
                    </div>
                    <h2 className="featured-card-title">{featured.name}</h2>
                    <p className="featured-card-host">Hosted by <strong>{featured.host}</strong></p>
                  </div>
                </div>
                <div className="featured-card-right">
                  <div className="featured-card-info">
                    <div className="featured-info-item">
                      <Users size={14} strokeWidth={2} />
                      <span>{featured.maxParticipants} participants</span>
                    </div>
                  </div>
                  <Link to={`/tournaments/${featured.id}`} className="btn btn-primary">
                    View Tournament
                    <ChevronRight size={15} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PLATFORM FEATURES ────────────────────────────────────── */}
      <section className="pub-section features-section" aria-label="Platform Features">
        <div className="pub-section-inner">
          <div className="pub-section-label">
            <Zap size={14} strokeWidth={2} />
            Platform Features
          </div>
          <h2 className="pub-section-title">Everything you need to run a tournament</h2>
          <p className="pub-section-subtitle">
            From registration to champion — Nakata Arena handles the entire tournament lifecycle.
          </p>
          <div className="features-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-card-icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="feature-card-title">{title}</h3>
                <p className="feature-card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST TOURNAMENTS ────────────────────────────────────── */}
      <section className="pub-section" aria-label="Latest Tournaments">
        <div className="pub-section-inner">
          <div className="pub-section-label">
            <Trophy size={14} strokeWidth={2} />
            Latest Tournaments
          </div>
          <div className="latest-header">
            <h2 className="pub-section-title">Active &amp; Recent Tournaments</h2>
            <Link to="/tournaments" className="btn btn-ghost btn-sm latest-view-all">
              View All
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>

          {loadingT ? (
            <div className="latest-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                </div>
              ))}
            </div>
          ) : latest.length === 0 ? (
            <div className="latest-empty">
              <Trophy size={32} strokeWidth={1} />
              <p>No tournaments yet. Check back soon.</p>
            </div>
          ) : (
            <div className="latest-grid">
              {latest.map((t) => (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="latest-card"
                  style={{ '--game-color': getGameColor(t.game) }}
                >
                  <div className="latest-card-stripe" />
                  <div className="latest-card-inner">
                    <div className="latest-card-head">
                      <span className={`badge badge-${t.status?.toLowerCase()}`}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                      <span className="latest-card-game">
                        <Gamepad2 size={11} strokeWidth={2} />
                        {t.game}
                      </span>
                    </div>
                    <h3 className="latest-card-name">{t.name}</h3>
                    <p className="latest-card-host">by {t.host}</p>
                    <div className="latest-card-foot">
                      <span className="latest-card-slots">
                        <Users size={12} strokeWidth={2} />
                        {t.maxParticipants} slots
                      </span>
                      <span className="latest-card-cta">
                        View <ChevronRight size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="cta-section" aria-label="Call to action">
        <div className="pub-section-inner cta-inner">
          <div className="cta-bg" aria-hidden="true">
            <div className="cta-bg-glow" />
          </div>
          <h2 className="cta-title">Ready to run your next tournament?</h2>
          <p className="cta-subtitle">
            Sign in as an organizer to create tournaments, manage rosters, and generate brackets in seconds.
          </p>
          <Link to="/login" className="btn btn-primary cta-btn">
            <Zap size={16} strokeWidth={2.5} />
            Get Started as Organizer
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="pub-footer" role="contentinfo">
        <div className="pub-section-inner pub-footer-inner">
          <div className="pub-footer-brand">
            <div className="pub-footer-brand-row">
              <div className="pub-footer-brand-icon">
                <Zap size={13} strokeWidth={2.5} />
              </div>
              <span className="pub-footer-brand-name">
                NAKATA<span className="pub-footer-brand-accent"> ARENA</span>
              </span>
            </div>
            <p className="pub-footer-tagline">Compete. Organize. Become Champion.</p>
          </div>

          <nav className="pub-footer-links" aria-label="Footer navigation">
            <Link to="/tournaments" className="pub-footer-link">Tournaments</Link>
            <Link to="/login" className="pub-footer-link">Organizer Login</Link>
          </nav>
        </div>
        <div className="pub-footer-copy">
          <div className="pub-section-inner">
            &copy; {new Date().getFullYear()} Nakata Arena. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
