import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavBar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        Esport Tournament
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/tournaments" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
          Tournaments
        </NavLink>
        <NavLink to="/participants" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
          Participants
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>
          Profile
        </NavLink>
      </div>
      <div className="navbar-user">
        <span>
          {currentUser?.username} <span className="role-badge">{currentUser?.role}</span>
        </span>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default NavBar
