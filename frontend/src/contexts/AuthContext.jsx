import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('scms_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      localStorage.removeItem('scms_token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, remember_me: rememberMe })
    const token = data.token

    localStorage.setItem('scms_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(data.user)

    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    const token = data.token

    localStorage.setItem('scms_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(data.user)

    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* token may already be invalid */ }

    localStorage.removeItem('scms_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully.')
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(prev => ({ ...prev, ...updated }))
  }, [])

  const hasRole = useCallback((roles) => {
    if (!user?.role) return false
    const roleList = Array.isArray(roles) ? roles : [roles]
    return roleList.includes(user.role.name)
  }, [user])

  const value = { user, loading, login, register, logout, updateUser, hasRole, fetchUser }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
