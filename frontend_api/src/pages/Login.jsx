import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(email, password)
      const dest = loc.state?.from?.pathname || '/dashboard'
      nav(dest, { replace: true })
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>
      <div><label>Email<br/><input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/></label></div>
      <div><label>Password<br/><input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/></label></div>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      <button disabled={busy} type="submit">{busy ? 'Signing in…' : 'Login'}</button>
      <p style={{marginTop:12}}>
        <Link to="/password-reset">Forgot password?</Link>
      </p>
    </form>
  )
}
