import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RequestReset from './pages/RequestReset'
import ConfirmReset from './pages/ConfirmReset'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthProvider'

export default function App() {
  const { token, logout } = useAuth()

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16 }}>
      <header style={{ marginBottom: 24, display:'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/password-reset">Reset</Link>
        <Link to="/dashboard">Dashboard</Link>
        {token && <button onClick={logout}>Logout</button>}
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<RequestReset />} />
        <Route path="/password-reset/confirm" element={<ConfirmReset />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </div>
  )
}
