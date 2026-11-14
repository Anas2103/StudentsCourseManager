/** Format date string to readable format */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', ...options
  })
}

/** Format datetime string */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/** Format time string (HH:mm) */
export const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

/** Get initials from name */
export const getInitials = (name = '') => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

/** Capitalize first letter */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

/** Truncate text */
export const truncate = (text, length = 80) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/** Extract validation errors from Axios error */
export const getValidationErrors = (error) => {
  return error?.response?.data?.errors || {}
}

/** Format number with comma separator */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString('en-US')
}

/** Color based on percentage */
export const pctColor = (pct) => {
  if (pct >= 80) return 'text-green-600'
  if (pct >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/** Build query string from object */
export const buildQuery = (params) => {
  const filtered = Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  return filtered.length ? '?' + new URLSearchParams(Object.fromEntries(filtered)).toString() : ''
}
