import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      const [{ data: prof }, { data: sess }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5)
      ])
      setProfile(prof)
      setSessions(sess || [])
      setLoading(false)
    }
    load()
  }, [session])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0d0f0a 0%, #111409 40%, #0a0d12 100%)' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a97e', fontSize: isMobile ? '0.95rem' : '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,169,126,0.1)', border: '1px solid rgba(200,169,126,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a97e', flexShrink: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: 0 },
    navRight: { display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.7rem' },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', color: '#5a5248', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' },
    body: { maxWidth: '820px', margin: '0 auto', padding: isMobile ? '1.5rem 1rem' : '3rem 1.5rem' },
    greeting: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.4rem,4vw,2.4rem)', color: '#e8d5b0', marginBottom: '0.4rem' },
    sub: { color: '#5a5248', fontSize: '0.88rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' },
    banner: { background: 'rgba(200,169,126,0.06)', border: '1px solid rgba(200,169,126,0.15)', borderRadius: '12px', padding: isMobile ? '1rem' : '1.2rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' },
    bannerText: { fontSize: '0.87rem', color: '#a09070' },
    bannerBtn: { padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg,#c8a97e,#a0845e)', border: 'none', borderRadius: '999px', color: '#0d0f0a', fontSize: '0.82rem', fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, cursor: 'pointer', alignSelf: isMobile ? 'stretch' : 'auto', textAlign: 'center' },
    grid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: isMobile ? '1rem 1.2rem' : '1.5rem', cursor: 'pointer', transition: 'all 0.2s', display: isMobile ? 'flex' : 'block', alignItems: 'center', gap: '0.9rem' },
    cardIcon: { fontSize: '1.4rem', marginBottom: isMobile ? 0 : '0.6rem', flexShrink: 0 },
    cardTitle: { fontFamily: "'Playfair Display',Georgia,serif", color: '#e8d5b0', fontSize: '0.95rem', marginBottom: '0.2rem' },
    cardDesc: { fontSize: '0.78rem', color: '#3a3428', lineHeight: 1.5 },
    sectionTitle: { fontFamily: "'Playfair Display',Georgia,serif", color: '#c8a97e', fontSize: '0.95rem', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    viewAll: { fontSize: '0.75rem', color: '#5a5248', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" },
    sessionCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: isMobile ? '0.85rem 1rem' : '1rem 1.3rem', marginBottom: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' },
    sessionTitle: { color: '#c8bfb0', fontSize: '0.87rem', marginBottom: '0.2rem' },
    sessionDate: { color: '#3a3428', fontSize: '0.73rem' },
    empty: { textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' },
    emptyText: { color: '#3a3428', fontSize: '0.85rem', fontStyle: 'italic' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '2rem', animation: 'pulse 2s infinite', color: '#c8a97e' }}>⟡</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}><span style={s.navMM}>MM</span>{isMobile ? 'Mystic Madman' : 'Mystic Madman'}</div>
        <div style={s.navRight}>
          <button style={s.navBtn} onClick={() => navigate('/readings')}>{isMobile ? 'Readings' : 'Past Readings'}</button>
          <button style={s.navBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button style={s.navBtn} onClick={() => supabase.auth.signOut()}>{isMobile ? 'Out' : 'Sign Out'}</button>
        </div>
      </nav>

      <div style={s.body}>
        <h1 style={s.greeting}>{greeting}, {firstName}.</h1>
        <p style={s.sub}>What would you like to explore today?</p>

        {!profile?.full_name && (
          <div style={s.banner}>
            <span style={s.bannerText}>✨ Complete your profile so Sage can personalise every reading</span>
            <button style={s.bannerBtn} onClick={() => navigate('/profile')}>Set Up Profile →</button>
          </div>
        )}

        <div style={s.grid}>
          {[
            { icon: '⟡', title: 'New Session', desc: 'Begin a full holistic reading across health, dreams, mind, astrology and numerology', action: () => navigate('/session') },
            { icon: '📖', title: 'Past Readings', desc: 'Revisit your previous sessions and track your journey over time', action: () => navigate('/readings') },
            { icon: '👤', title: 'My Profile', desc: 'Update your birth details, astrology signs and personal information', action: () => navigate('/profile') },
          ].map(c => (
            <div key={c.title} style={s.card} onClick={c.action}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,169,126,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div style={s.cardIcon}>{c.icon}</div>
              <div>
                <div style={s.cardTitle}>{c.title}</div>
                <div style={s.cardDesc}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.sectionTitle}>
          Recent Sessions
          {sessions.length > 0 && <span style={s.viewAll} onClick={() => navigate('/readings')}>View all →</span>}
        </div>

        {sessions.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyText}>No sessions yet — begin your first reading above</p>
          </div>
        ) : (
          sessions.map(sess => (
            <div key={sess.id} style={s.sessionCard} onClick={() => navigate('/readings')}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,169,126,0.15)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div>
                <div style={s.sessionTitle}>{sess.title || 'Holistic Reading'}</div>
                <div style={s.sessionDate}>{formatDate(sess.created_at)}</div>
              </div>
              <span style={{ color: '#3a3428', fontSize: '0.78rem' }}>View →</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
