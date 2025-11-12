import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <div>Loading…</div>
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}
