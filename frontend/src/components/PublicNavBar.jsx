import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Trophy, Menu, X, Zap, LayoutDashboard, LogIn } from 'lucide-react'
import './PublicNavBar.css'

export default function PublicNavBar() {
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="pub-nav" role="banner">
      <div className="pub-nav-inner">
        {/* Brand */}
        <Link to="/" className="pub-nav-brand" aria-label="Nakata Arena home">
          <div className="pub-nav-brand-icon">
            <Zap size={15} strokeWidth={2.5} />
          </div>
          <span className="pub-nav-brand-name">
            NAKATA<span className="pub-nav-brand-accent"> ARENA</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="pub-nav-links" aria-label="Public navigation">
          <NavLink to="/" end className={({ isActive }) => 'pub-nav-link' + (isActive ? ' active' : '')}>
            Home
          </NavLink>
          <NavLink to="/tournaments" className={({ isActive }) => 'pub-nav-link' + (isActive ? ' active' : '')}>
            <Trophy size={14} strokeWidth={2} />
            Tournaments
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="pub-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-secondary btn-sm">
              <LayoutDashboard size={14} strokeWidth={2} />
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm pub-nav-login-btn">
              <LogIn size={14} strokeWidth={2} />
              Organizer Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="pub-nav-hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="pub-nav-mobile" aria-label="Mobile navigation">
          <NavLink to="/" end className="pub-nav-mobile-link" onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/tournaments" className="pub-nav-mobile-link" onClick={() => setMobileOpen(false)}>
            Tournaments
          </NavLink>
          {isAuthenticated ? (
            <Link to="/dashboard" className="pub-nav-mobile-link" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="pub-nav-mobile-link pub-nav-mobile-login" onClick={() => setMobileOpen(false)}>
              Organizer Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
