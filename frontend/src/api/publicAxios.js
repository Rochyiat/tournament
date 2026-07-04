/**
 * publicAxios.js
 *
 * A separate Axios instance for public (unauthenticated) requests.
 * Attaches JWT if present but does NOT redirect to /login on 401 —
 * public pages must gracefully handle auth errors themselves.
 */
import axios from 'axios'

const publicApi = axios.create({
  baseURL: '/api',
})

// Attach token if logged in, but don't require it
publicApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// No 401 redirect — public pages handle errors inline
publicApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default publicApi
