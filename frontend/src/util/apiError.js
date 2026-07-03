export function getApiErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 400) {
    return data?.message || 'Bad request. Please check your input.'
  }
  if (status === 401) {
    return data?.message || 'Session expired. Please log in again.'
  }
  if (status === 403) {
    return data?.message || 'You do not have permission to perform this action.'
  }
  if (status === 404) {
    return data?.message || 'Requested resource was not found.'
  }
  if (status === 409) {
    return data?.message || 'Conflict detected. Please refresh and try again.'
  }
  if (status >= 500) {
    return data?.message || 'Server error. Please try again later.'
  }

  return data?.message || fallback
}
