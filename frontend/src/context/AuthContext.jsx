import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

// ── Helpers ───────────────────────────────────────────────────────────────────

function persistSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.common['Authorization']
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user')
    try { return stored ? JSON.parse(stored) : null } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // Sync token into axios header on mount / token change
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token: newToken, user } = response.data.data

      persistSession(newToken, user)
      setToken(newToken)
      setCurrentUser(user)

      return user
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (username, email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token: newToken, user } = response.data.data

      persistSession(newToken, user)
      setToken(newToken)
      setCurrentUser(user)

      return user
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setCurrentUser(null)
  }, [])

  const value = {
    token,
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
