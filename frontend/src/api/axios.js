import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Attach stored token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('scms_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 422) {
      // Validation errors — let the caller handle them
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (message) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
