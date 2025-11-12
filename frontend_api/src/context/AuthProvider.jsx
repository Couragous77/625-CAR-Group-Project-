import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../lib/auth'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('auth_token')
    if (saved) setToken(saved)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    const t = res?.access_token
    if (!t) throw new Error('No token returned')
    localStorage.setItem('auth_token', t)
    setToken(t)
  }

  const register = async (email, password, name) => {
    await registerUser({ email, password, name })
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
  }

  const value = useMemo(() => ({ token, login, logout, register, loading }), [token, loading])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
