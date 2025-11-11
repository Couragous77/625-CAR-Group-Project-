import { useState } from 'react'
import { requestPasswordReset } from '../lib/auth'

export default function RequestReset() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(''); setErr('')
    setBusy(true)
    try {
      await requestPasswordReset(email)
      setMsg('If that email exists, a reset link was sent.')
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>Password Reset</h2>
      <div><label>Email<br/><input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/></label></div>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      {msg && <p style={{color:'green'}}>{msg}</p>}
      <button disabled={busy} type="submit">{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
  )
}
