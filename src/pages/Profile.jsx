import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0d0f0a 0%, #111409 40%, #0a0d12 100%)', padding: '3rem 1.5rem' },
  wrap: { maxWidth: '580px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  symbol: { fontSize: '2rem', marginBottom: '0.4rem' },
  title: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: '2rem', fontWeight: 700, color: '#e8d5b0', margin: '0 0 0.3rem' },
  subtitle: { fontSize: '0.8rem', color: '#5a5248', letterSpacing: '0.15em', textTransform: 'uppercase' },
  divider: { width: '50px', height: '1px', background: 'linear-gradient(90deg,transparent,#c8a97e,transparent)', margin: '1rem auto 0' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1rem', color: '#c8a97e', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(200,169,126,0.15)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.72rem', color: '#c8a97e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#e8d5b0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,#c8a97e,#a0845e)', border: 'none', borderRadius: '999px', color: '#0d0f0a', fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.95rem', fontWeight: 700, marginTop: '0.5rem' },
  skip: { width: '100%', padding: '0.7rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px', color: '#3a3428', fontSize: '0.82rem', marginTop: '0.75rem' },
  success: { background: 'rgba(168,196,162,0.1)', border: '1px solid rgba(168,196,162,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#a8c4a2', fontSize: '0.85rem', marginBottom: '1rem' },
  error: { background: 'rgba(212,100,100,0.1)', border: '1px solid rgba(212,100,100,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#d47070', fontSize: '0.85rem', marginBottom: '1rem' },
  hint: { fontSize: '0.75rem', color: '#3a3428', fontStyle: 'italic', marginTop: '0.3rem' },
}

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces','Unknown']

export default function Profile({ session }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', sun_sign: '', moon_sign: '', rising_sign: '', birth_place: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) setForm({ full_name: data.full_name || '', date_of_birth: data.date_of_birth || '', sun_sign: data.sun_sign || '', moon_sign: data.moon_sign || '', rising_sign: data.rising_sign || '', birth_place: data.birth_place || '' })
      setLoading(false)
    }
    load()
  }, [session])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('')
    const { error } = await supabase.from('profiles').upsert({ id: session.user.id, ...form })
    if (error) setError(error.message)
    else { setSuccess('Profile saved.'); setTimeout(() => navigate('/dashboard'), 1000) }
    setSaving(false)
  }

  if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#c8a97e', fontSize: '2rem' }}>⟡</div></div>

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.symbol}>⟡</div>
          <h1 style={s.title}>Your Profile</h1>
          <p style={s.subtitle}>Sage remembers this so you never have to re-enter it</p>
          <div style={s.divider} />
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <div style={s.section}>
          <div style={s.sectionTitle}>🌿 Personal</div>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full birth name" />
            <p style={s.hint}>Used for numerological calculations</p>
          </div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Date of Birth</label>
              <input style={s.input} type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Place of Birth</label>
              <input style={s.input} value={form.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="City, Country" />
            </div>
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>✨ Astrology</div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Sun Sign</label>
              <select style={s.input} value={form.sun_sign} onChange={e => set('sun_sign', e.target.value)}>
                <option value="">Select...</option>
                {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Moon Sign</label>
              <select style={s.input} value={form.moon_sign} onChange={e => set('moon_sign', e.target.value)}>
                <option value="">Select...</option>
                {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Rising Sign</label>
            <select style={s.input} value={form.rising_sign} onChange={e => set('rising_sign', e.target.value)}>
              <option value="">Select...</option>
              {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p style={s.hint}>Requires your exact birth time to calculate — leave as Unknown if unsure</p>
          </div>
        </div>

        <button style={s.btn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile →'}
        </button>
        <button style={s.skip} onClick={() => navigate('/dashboard')}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
