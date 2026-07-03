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
          <h1>Profile</h1>
          <div className="profile-details">
            <div>
              <dt>Username</dt>
              <dd>{currentUser?.username ?? '—'}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{currentUser?.role ?? '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{currentUser?.email ?? '—'}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
