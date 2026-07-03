import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import './Profile.css'

function Profile() {
  const { currentUser } = useAuth()

  return (
    <div>
      <NavBar />
      <div className="page-container profile-page">
        <div className="profile-card">
          <div className="profile-card-header">
            <h1 className="page-title">Profile</h1>
          </div>
          <dl className="profile-details">
            <div>
              <dt>Username</dt>
              <dd>{currentUser?.username ?? '—'}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd><span className="role-badge">{currentUser?.role ?? '—'}</span></dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{currentUser?.email ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Profile
