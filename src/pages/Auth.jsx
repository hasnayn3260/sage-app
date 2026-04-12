import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

function MMMonogram() {
  return (
    <div style={{
      width: '72px', height: '72px', borderRadius: '50%',
      background: 'rgba(200,160,80,0.07)',
      border: '1.5px solid rgba(200,160,80,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 1.2rem',
      boxShadow: '0 0 32px rgba(200,160,80,0.06)',
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: '1.55rem', fontWeight: 700,
        color: '#c8a050', letterSpacing: '0.03em',
      }}>MM</span>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '2rem',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(200,160,80,0.04) 0%, transparent 65%), #0a0805',
  },
  card: { width: '100%', maxWidth: '420px' },
  title: {
    textAlign: 'center',
    fontFamily: "'Cormorant Garamond',Georgia,serif",
    fontSize: 'clamp(2rem,8vw,2.8rem)',
    fontWeight: 600, color: '#e8dfc8', marginBottom: '0.3rem', letterSpacing: '0.01em',
  },
  subtitle: {
    textAlign: 'center', fontSize: '0.73rem', color: '#4a4038',
    letterSpacing: '0.2em', textTransform: 'uppercase',
    marginBottom: '2.5rem', fontFamily: "'Lora',Georgia,serif",
  },
  divider: {
    width: '50px', height: '1px',
    background: 'linear-gradient(90deg,transparent,#c8a050,transparent)',
    margin: '0 auto 2.5rem',
  },
  tabs: { display: 'flex', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tab: (active) => ({
    flex: 1, padding: '0.7rem', background: 'transparent', border: 'none',
    borderBottom: active ? '2px solid #c8a050' : '2px solid transparent',
    color: active ? '#c8a050' : '#3a3028',
    fontSize: '0.85rem', fontFamily: "'Lora',Georgia,serif",
    letterSpacing: '0.05em', transition: 'all 0.2s', marginBottom: '-1px', cursor: 'pointer',
  }),
  label: {
    display: 'block', fontSize: '0.71rem', color: '#9a7830',
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem',
    fontFamily: "'Lora',Georgia,serif",
  },
  input: {
    width: '100%',
    background: 'rgba(200,160,80,0.025)',
    border: '1px solid rgba(200,160,80,0.1)',
    borderRadius: '8px', padding: '0.75rem 1rem',
    color: '#e8dfc8', fontSize: '0.9rem', outline: 'none',
    marginBottom: '1.2rem', fontFamily: "'Lora',Georgia,serif",
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', padding: '0.9rem',
    background: 'linear-gradient(135deg,#c8a050,#9a7830)',
    border: 'none', borderRadius: '999px', color: '#0a0805',
    fontFamily: "'Cormorant Garamond',Georgia,serif",
    fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem',
    letterSpacing: '0.04em', cursor: 'pointer',
  },
  error: {
    background: 'rgba(180,80,80,0.07)', border: '1px solid rgba(180,80,80,0.18)',
    borderRadius: '8px', padding: '0.75rem 1rem',
    color: '#c87070', fontSize: '0.85rem', marginBottom: '1rem',
    fontFamily: "'Lora',Georgia,serif",
  },
  success: {
    background: 'rgba(140,180,140,0.07)', border: '1px solid rgba(140,180,140,0.18)',
    borderRadius: '8px', padding: '0.75rem 1rem',
    color: '#90b890', fontSize: '0.85rem', marginBottom: '1rem',
    fontFamily: "'Lora',Georgia,serif",
  },
  backLink: {
    display: 'block', textAlign: 'center', marginTop: '2rem',
    fontSize: '0.78rem', color: '#3a3028', fontFamily: "'Lora',Georgia,serif",
    cursor: 'pointer', letterSpacing: '0.04em',
  },
}

export default function Auth() {
  const navigate = useNavigate()
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
        <MMMonogram />
        <h1 style={s.title}>Mystic Madman</h1>
        <p style={s.subtitle}>Holistic AI Life Coach</p>
        <div style={s.divider} />
        <div style={s.tabs}>
          <button style={s.tab(mode === 'login')} onClick={() => { setMode('login'); setError(''); setMessage('') }}>Sign In</button>
          <button style={s.tab(mode === 'signup')} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create Account</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        {message && <div style={s.success}>{message}</div>}
        <label style={s.label}>Email</label>
        <input
          style={s.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
          onFocus={e => e.target.style.borderColor = 'rgba(200,160,80,0.35)'}
          onBlur={e => e.target.style.borderColor = 'rgba(200,160,80,0.1)'}
        />
        <label style={s.label}>Password</label>
        <input
          style={s.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          onFocus={e => e.target.style.borderColor = 'rgba(200,160,80,0.35)'}
          onBlur={e => e.target.style.borderColor = 'rgba(200,160,80,0.1)'}
        />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Enter →' : 'Create Account →'}
        </button>
        <span style={s.backLink} onClick={() => navigate('/')}>← Back to home</span>
      </div>
    </div>
  )
}
