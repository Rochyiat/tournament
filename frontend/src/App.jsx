import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Admin pages
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Tournament from './pages/Tournament'
import TournamentDetail from './pages/TournamentDetail'
import Participant from './pages/Participant'
import Profile from './pages/Profile'

// Public pages
import Landing from './pages/Landing'
import PublicTournamentList from './pages/PublicTournamentList'
import PublicTournamentDetail from './pages/PublicTournamentDetail'

/**
 * AuthAwareRoute
 *
 * Renders the admin component when the user is authenticated,
 * or the public component when they are not.
 *
 * This lets /tournaments and /tournaments/:id serve both the
 * public website and the admin dashboard at the same URL,
 * so existing NavBar links don't need to change.
 */
function AuthAwareRoute({ publicElement, adminElement }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Loading…" />
  }

  return isAuthenticated ? adminElement : publicElement
}

function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public routes ──────────────────────────────────────────── */}

      {/* Landing page — public home */}
      <Route path="/" element={<Landing />} />

      {/* /tournaments — public list OR admin list depending on auth state */}
      <Route
        path="/tournaments"
        element={
          <AuthAwareRoute
            publicElement={<PublicTournamentList />}
            adminElement={
              <ProtectedRoute>
                <Tournament />
              </ProtectedRoute>
            }
          />
        }
      />

      {/* /tournaments/:id — public detail OR admin detail depending on auth state */}
      <Route
        path="/tournaments/:id"
        element={
          <AuthAwareRoute
            publicElement={<PublicTournamentDetail />}
            adminElement={
              <ProtectedRoute>
                <TournamentDetail />
              </ProtectedRoute>
            }
          />
        }
      />

      {/* /tournaments/:id/bracket — always public read-only bracket view */}
      <Route
        path="/tournaments/:id/bracket"
        element={<PublicTournamentDetail />}
      />

      {/* ─── Auth routes ────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ─── Protected admin routes ─────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/participants"
        element={
          <ProtectedRoute>
            <Participant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ─── Fallback ───────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
