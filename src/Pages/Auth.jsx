import { useState } from 'react'
import { supabase } from '../supabase'

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(160deg, #0d0f0a 0%, #111409 40%, #0a0d12 100%)' },
  card: { width: '100%', maxWidth: '420px' },
  symbol: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { textAlign: 'center', fontFamily: "'Playfair Display',Georgia,serif", fontSize: '2.8rem', fontWeight: 700, color: '#e8d5b0', marginBottom: '0.4rem' },
  subtitle: { textAlign: 'center', fontSize: '0.78rem', color: '#5a5248', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '2.5rem' },
  divider: { width: '50px', height: '1px', background: 'linear-gradient(90deg,transparent,#c8a97e,transparent)', margin: '0 auto 2.5rem' },
  tabs: { display: 'flex', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tab: (active) => ({ flex: 1, padding: '0.7rem', background: 'transparent', border: 'none', borderBottom: active ? '2px solid #c8a97e' : '2px solid transparent', color: active ? '#c8a97e' : '#3a3428', fontSize: '0.85rem', fontFamily: "'Lora',Georgia,serif", letterSpacing: '0.05em', transition: 'all 0.2s', marginBottom: '-1px' }),
  label: { display: 'block', fontSize: '0.73rem', color: '#c8a97e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#e8d5b0', fontSize: '0.9rem', outline: 'none', marginBottom: '1.2rem' },
  btn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#c8a97e,#a0845e)', border: 'none', borderRadius: '999px', color: '#0d0f0a', fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.95rem', fontWeight: 700, marginTop: '0.5rem', letterSpacing: '0.02em' },
  error: { background: 'rgba(212,100,100,0.1)', border: '1px solid rgba(212,100,100,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#d47070', fontSize: '0.85rem', marginBottom: '1rem' },
  success: { background: 'rgba(168,196,162,0.1)', border: '1px solid rgba(168,196,162,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#a8c4a2', fontSize: '0.85rem', marginBottom: '1rem' },
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setError(''); setMessage(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link.')
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.symbol}>⟡</div>
        <h1 style={s.title}>Sage</h1>
        <p style={s.subtitle}>Holistic Life Coach</p>
        <div style={s.divider} />
        <div style={s.tabs}>
          <button style={s.tab(mode === 'login')} onClick={() => { setMode('login'); setError(''); setMessage('') }}>Sign In</button>
          <button style={s.tab(mode === 'signup')} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create Account</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        {message && <div style={s.success}>{message}</div>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Enter Sage →' : 'Create Account →'}
        </button>
      </div>
    </div>
  )
}
