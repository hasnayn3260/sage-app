import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const BANNER_DISMISS_KEY = 'mm_onboarding_banner_dismissed'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [userConfig, setUserConfig] = useState(null)
  const [configChecked, setConfigChecked] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [bannerDismissed, setBannerDismissed] = useState(() => !!sessionStorage.getItem(BANNER_DISMISS_KEY))

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      const [{ data: config }, { data: sess }] = await Promise.all([
        supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
      ])
      if (!config) {
        navigate('/onboarding', { replace: true })
        return
      }
      setUserConfig(config)
      setConfigChecked(true)
      setSessions(sess || [])
      setLoading(false)
    }
    load()
  }, [session, navigate])

  const dismissBanner = () => {
    sessionStorage.setItem(BANNER_DISMISS_KEY, '1')
    setBannerDismissed(true)
  }

  const firstName = userConfig?.preferred_name || userConfig?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const showOnboardingBanner = userConfig?.onboarding_skipped === true && !bannerDismissed

  const s = {
    page: { minHeight: '100vh', background: '#0a0805', color: '#e8dfc8' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.1rem 2rem', borderBottom: '1px solid rgba(200,160,80,0.07)', position: 'sticky', top: 0, background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(12px)', zIndex: 100 },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a050', fontSize: isMobile ? '0.95rem' : '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,160,80,0.1)', border: '1px solid rgba(200,160,80,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a050', flexShrink: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" },
    navRight: { display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.7rem' },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '999px', color: '#7a6e5e', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Lora',Georgia,serif" },

    body: { maxWidth: '820px', margin: '0 auto', padding: isMobile ? '1.5rem 1rem 3rem' : '3rem 1.5rem' },
    greeting: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.4rem,4vw,2.4rem)', color: '#e8dfc8', marginBottom: '0.4rem', fontWeight: 500 },
    sub: { color: '#7a6e5e', fontSize: '0.88rem', marginBottom: isMobile ? '1.5rem' : '2.5rem', fontFamily: "'Lora',Georgia,serif" },

    banner: { background: 'rgba(200,160,80,0.04)', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '12px', padding: isMobile ? '0.9rem 1rem' : '1rem 1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.7rem' },
    bannerText: { fontSize: '0.85rem', color: '#c8bfa8', fontFamily: "'Lora',Georgia,serif", flex: 1 },
    bannerActions: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
    bannerBtn: { padding: '0.45rem 1.1rem', background: 'linear-gradient(135deg,#c8a050,#9a7830)', border: 'none', borderRadius: '999px', color: '#0a0805', fontSize: '0.8rem', fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, cursor: 'pointer' },
    bannerDismiss: { background: 'none', border: 'none', color: '#5a5040', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif", padding: '0.3rem 0.6rem' },

    grid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,160,80,0.08)', borderRadius: '12px', padding: isMobile ? '1rem 1.2rem' : '1.5rem', cursor: 'pointer', transition: 'all 0.2s', display: isMobile ? 'flex' : 'block', alignItems: 'center', gap: '0.9rem' },
    cardIcon: { fontSize: '1.4rem', marginBottom: isMobile ? 0 : '0.6rem', flexShrink: 0 },
    cardTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#e8dfc8', fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.2rem' },
    cardDesc: { fontSize: '0.78rem', color: '#7a6e5e', lineHeight: 1.5, fontFamily: "'Lora',Georgia,serif" },

    sectionTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a050', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '0.03em' },
    viewAll: { fontSize: '0.75rem', color: '#7a6e5e', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" },
    sessionCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,160,80,0.08)', borderRadius: '10px', padding: isMobile ? '0.85rem 1rem' : '1rem 1.3rem', marginBottom: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' },
    sessionTitle: { color: '#c8bfa8', fontSize: '0.87rem', marginBottom: '0.2rem', fontFamily: "'Lora',Georgia,serif" },
    sessionDate: { color: '#5a5040', fontSize: '0.73rem', fontFamily: "'Lora',Georgia,serif" },
    empty: { textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(200,160,80,0.06)', borderRadius: '10px' },
    emptyText: { color: '#5a5040', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" },
  }

  if (loading || !configChecked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0805' }}>
      <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.4rem', fontWeight: 700, color: '#c8a050', animation: 'pulse 2s infinite' }}>MM</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}><span style={s.navMM}>MM</span>Mystic Madman</div>
        <div style={s.navRight}>
          <button style={s.navBtn} onClick={() => navigate('/readings')}>{isMobile ? 'Sessions' : 'Past Sessions'}</button>
          <button style={s.navBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button style={s.navBtn} onClick={() => supabase.auth.signOut()}>{isMobile ? 'Out' : 'Sign Out'}</button>
        </div>
      </nav>

      <div style={s.body}>
        <h1 style={s.greeting}>{greeting}, {firstName}.</h1>
        <p style={s.sub}>What would you like to explore today?</p>

        {showOnboardingBanner && (
          <div style={s.banner}>
            <span style={s.bannerText}>Complete your foundation to get deeper, more personalised sessions</span>
            <div style={s.bannerActions}>
              <button style={s.bannerBtn} onClick={() => navigate('/onboarding')}>Continue →</button>
              <button style={s.bannerDismiss} onClick={dismissBanner}>Dismiss</button>
            </div>
          </div>
        )}

        <div style={s.grid}>
          {[
            { icon: '⟡', title: 'New Session', desc: 'Begin a holistic session across the areas of life that matter most right now', action: () => navigate('/session') },
            { icon: '📖', title: 'Past Sessions', desc: 'Revisit your previous sessions and track your journey over time', action: () => navigate('/readings') },
            { icon: '👤', title: 'My Profile', desc: 'Update your identity, beliefs, vision and more', action: () => navigate('/profile') },
          ].map(c => (
            <div key={c.title} style={s.card} onClick={c.action}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,160,80,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,160,80,0.08)'}>
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
            <p style={s.emptyText}>No sessions yet — begin your first session above</p>
          </div>
        ) : (
          sessions.map(sess => (
            <div key={sess.id} style={s.sessionCard} onClick={() => navigate('/readings')}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,160,80,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,160,80,0.08)'}>
              <div>
                <div style={s.sessionTitle}>{sess.title || 'Holistic Session'}</div>
                <div style={s.sessionDate}>{formatDate(sess.created_at)}</div>
              </div>
              <span style={{ color: '#5a5040', fontSize: '0.78rem' }}>View →</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
