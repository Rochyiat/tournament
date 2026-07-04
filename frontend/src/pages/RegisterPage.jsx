import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import './RegisterPage.css'

function RegisterPage() {
  const { register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  // Already logged in → go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function validate() {
    const e = {}
    if (!form.username.trim())
      e.username = 'Username is required'
    else if (form.username.trim().length < 3)
      e.username = 'Username must be at least 3 characters'

    if (!form.email.trim())
      e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address'

    if (!form.password)
      e.password = 'Password is required'
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters'

    if (!form.confirm)
      e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password)
      e.confirm = 'Passwords do not match'

    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await register(form.username.trim(), form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      // Handles both { message: "..." } and { errors: { field: "..." } }
      if (data?.errors && typeof data.errors === 'object') {
        const fieldErrors = {}
        for (const [field, msg] of Object.entries(data.errors)) {
          fieldErrors[field] = msg
        }
        setErrors(fieldErrors)
      } else {
        setServerError(
          data?.message || data?.error || 'Registration failed. Please try again.'
        )
      }
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">

        {/* ── Back to Home ── */}
        <Link to="/" className="auth-back-link" aria-label="Back to home page">
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to Home
        </Link>

        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Nakata Arena and start organizing tournaments</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          {/* Username */}
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
              autoFocus
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className={errors.username ? 'input-error' : ''}
            />
            {errors.username && (
              <span id="username-error" className="field-error" role="alert">
                {errors.username}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? 'confirm-error' : undefined}
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && (
              <span id="confirm-error" className="field-error" role="alert">
                {errors.confirm}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-register" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="register-login-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
