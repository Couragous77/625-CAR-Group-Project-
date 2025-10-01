import React, { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('loading...')
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setStatus(d.status))
      .catch(() => setStatus('error'))
  }, [])
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>Budget CAR — Web</h1>
      <p>API health: <strong>{status}</strong></p>
    </div>
  )
}
