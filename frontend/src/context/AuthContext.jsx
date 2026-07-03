import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user')
    try {
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Sync token ke axios header jika ada saat mount
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  /**
   * Login dengan username dan password.
   * Menyimpan token dan user ke localStorage.
   * Melempar error jika gagal sehingga LoginPage bisa menampilkan pesan.
   */
  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token: newToken, user } = response.data.data

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(user))

      setToken(newToken)
      setCurrentUser(user)

      return user
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Logout — hapus token dan user dari state dan localStorage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setCurrentUser(null)
    delete api.defaults.headers.common['Authorization']
  }, [])

  const value = {
    token,
    currentUser,
    loading,
    login,
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
