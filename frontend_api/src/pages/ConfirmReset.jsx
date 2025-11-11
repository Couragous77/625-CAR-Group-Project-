import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from '../lib/auth'

export default function ConfirmReset() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const tokenFromUrl = sp.get('token') || ''
  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setOk('')
    setBusy(true)
    try {
      await confirmPasswordReset({ token, new_password: password })
      setOk('Password updated. You can now log in.')
      setTimeout(()=>nav('/login'), 800)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>Set New Password</h2>
      <div><label>Token<br/><input value={token} onChange={(e)=>setToken(e.target.value)} required/></label></div>
      <div><label>New Password<br/><input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required minLength={6}/></label></div>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      {ok && <p style={{color:'green'}}>{ok}</p>}
      <button disabled={busy} type="submit">{busy ? 'Updating…' : 'Update password'}</button>
    </form>
  )
}
