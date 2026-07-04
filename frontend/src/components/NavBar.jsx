import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCircle,
  LogOut,
  Zap,
} from 'lucide-react'
import './NavBar.css'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/tournaments',  label: 'Tournaments',  Icon: Trophy },
  { to: '/participants', label: 'Participants', Icon: Users },
  { to: '/profile',      label: 'Profile',      Icon: UserCircle },
]

function NavBar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <NavLink to="/" className="navbar-brand" aria-label="Go to home page">
        <div className="navbar-brand-icon">
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span className="navbar-brand-text">NAKATA<span className="navbar-brand-accent"> ARENA</span></span>
      </NavLink>

      {/* Nav links */}
      <div className="navbar-links">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}
          >
            <Icon size={15} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* User area */}
      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="navbar-avatar" aria-hidden="true">
            {currentUser?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="navbar-user-details">
            <span className="navbar-username">{currentUser?.username}</span>
            <span className="role-badge">{currentUser?.role}</span>
          </div>
        </div>
        <button
          className="navbar-logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={15} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default NavBar
