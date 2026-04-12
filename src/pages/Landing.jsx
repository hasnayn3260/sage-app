import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── MM Monogram ───────────────────────────────────────
function MMCircle({ size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(200,160,80,0.07)',
      border: '1.5px solid rgba(200,160,80,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 24px rgba(200,160,80,0.05)',
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: size * 0.29, fontWeight: 700,
        color: '#c8a050', letterSpacing: '0.03em',
      }}>MM</span>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────
const DOMAINS = [
  { icon: '🫀', title: 'Physical Health', desc: 'Energy, sleep, nutrition, symptoms — your body as a living oracle, telling you exactly what it needs.' },
  { icon: '🌙', title: 'Dream Journal', desc: 'What your dreams reveal about your waking life — symbols, emotions, and recurring themes decoded.' },
  { icon: '🧠', title: 'Mind & Emotions', desc: 'Moods, fears, recurring thoughts, and the patterns running quietly beneath the surface of your days.' },
  { icon: '🎯', title: 'Goals & Context', desc: 'What you are pursuing, what feels stuck, and the life transitions shaping this particular moment.' },
  { icon: '✨', title: 'Astrology', desc: 'Your natal chart, current transits, and how the cosmic weather connects to your lived experience right now.' },
  { icon: '🔢', title: 'Numerology', desc: 'Your personal year, Life Path, and the numerical cycles revealing where you stand in the arc of your life.' },
]

// ── Component ─────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const domainsRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const scrollToDomains = () => domainsRef.current?.scrollIntoView({ behavior: 'smooth' })

  const s = {
    page: { background: '#0a0805', minHeight: '100vh', overflowX: 'hidden' },

    // Nav
    nav: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0.9rem 1.2rem' : '1.1rem 2.5rem',
      borderBottom: '1px solid rgba(200,160,80,0.07)',
      position: 'sticky', top: 0,
      background: 'rgba(10,8,5,0.88)',
      backdropFilter: 'blur(16px)',
      zIndex: 100,
    },
    navBrand: {
      display: 'flex', alignItems: 'center', gap: '0.65rem',
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600,
      color: '#c8a050', letterSpacing: '0.04em', cursor: 'pointer',
    },
    navSignIn: {
      padding: isMobile ? '0.45rem 1rem' : '0.5rem 1.3rem',
      background: 'transparent',
      border: '1px solid rgba(200,160,80,0.25)',
      borderRadius: '999px', color: '#9a7830',
      fontSize: '0.82rem', fontFamily: "'Lora',Georgia,serif",
      cursor: 'pointer', letterSpacing: '0.03em',
      transition: 'all 0.2s',
    },

    // Hero
    heroOuter: {
      textAlign: 'center',
      padding: isMobile ? '3.5rem 1.5rem 3rem' : '6rem 1.5rem 5rem',
      position: 'relative', overflow: 'hidden',
    },
    heroGlow: {
      position: 'absolute', top: '-20%', left: '50%',
      transform: 'translateX(-50%)',
      width: '600px', height: '400px', borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(200,160,80,0.04) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    heroInner: { maxWidth: '800px', margin: '0 auto', position: 'relative' },
    eyebrow: {
      fontSize: '0.7rem', letterSpacing: '0.24em',
      textTransform: 'uppercase', color: '#9a7830',
      marginBottom: '2rem', fontFamily: "'Lora',Georgia,serif",
    },
    heroTitle: {
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? 'clamp(2.6rem,10vw,3.4rem)' : 'clamp(3.2rem,6vw,5rem)',
      fontWeight: 400, color: '#e8dfc8', lineHeight: 1.1,
      marginBottom: '2rem', letterSpacing: '-0.01em',
    },
    heroTitleItalic: { color: '#c8a050', fontStyle: 'italic' },
    heroPara: {
      fontSize: isMobile ? '0.92rem' : '1rem',
      color: '#6a6050', lineHeight: 1.85,
      maxWidth: '580px', margin: '0 auto 2.8rem',
      fontFamily: "'Lora',Georgia,serif",
    },
    heroCtas: {
      display: 'flex', gap: '1rem',
      justifyContent: 'center', flexWrap: 'wrap',
    },
    ctaPrimary: {
      padding: isMobile ? '0.85rem 1.8rem' : '0.9rem 2.2rem',
      background: 'linear-gradient(135deg,#c8a050,#9a7830)',
      border: 'none', borderRadius: '999px', color: '#0a0805',
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 700,
      cursor: 'pointer', letterSpacing: '0.04em',
      boxShadow: '0 4px 24px rgba(200,160,80,0.2)',
      transition: 'all 0.2s',
    },
    ctaSecondary: {
      padding: isMobile ? '0.85rem 1.8rem' : '0.9rem 2.2rem',
      background: 'transparent',
      border: '1px solid rgba(200,160,80,0.2)',
      borderRadius: '999px', color: '#6a6050',
      fontFamily: "'Lora',Georgia,serif",
      fontSize: '0.88rem', cursor: 'pointer', letterSpacing: '0.03em',
      transition: 'all 0.2s',
    },

    // Divider
    divider: {
      width: '60px', height: '1px',
      background: 'linear-gradient(90deg,transparent,rgba(200,160,80,0.4),transparent)',
      margin: '0 auto',
    },

    // Domains section
    domainsSection: {
      padding: isMobile ? '3.5rem 1.2rem' : '6rem 2rem',
      maxWidth: '1040px', margin: '0 auto',
    },
    sectionEyebrow: {
      textAlign: 'center', fontSize: '0.7rem',
      letterSpacing: '0.24em', textTransform: 'uppercase',
      color: '#9a7830', marginBottom: '0.75rem',
      fontFamily: "'Lora',Georgia,serif",
    },
    sectionTitle: {
      textAlign: 'center',
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? 'clamp(1.7rem,5vw,2.2rem)' : 'clamp(2rem,4vw,2.8rem)',
      fontWeight: 400, color: '#e8dfc8',
      marginBottom: isMobile ? '2rem' : '3rem',
      lineHeight: 1.25,
    },
    domainsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(290px,1fr))',
      gap: '0.85rem',
    },
    domainCard: {
      background: 'rgba(255,255,255,0.012)',
      border: '1px solid rgba(200,160,80,0.07)',
      borderRadius: '12px', padding: '1.4rem 1.5rem',
      transition: 'all 0.25s', cursor: 'default',
      display: isMobile ? 'flex' : 'block',
      alignItems: 'flex-start', gap: '1rem',
    },
    domainIcon: { fontSize: '1.4rem', marginBottom: isMobile ? 0 : '0.7rem', flexShrink: 0, marginTop: isMobile ? '0.1rem' : 0 },
    domainTitle: {
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: '1.1rem', fontWeight: 600,
      color: '#e8dfc8', marginBottom: '0.4rem',
    },
    domainDesc: {
      fontSize: '0.83rem', color: '#6a6050',
      lineHeight: 1.7, fontFamily: "'Lora',Georgia,serif",
    },

    // Sample reading
    sampleSection: {
      padding: isMobile ? '3.5rem 1.2rem' : '6rem 2rem',
      maxWidth: '760px', margin: '0 auto',
    },
    sampleCard: {
      background: 'rgba(200,160,80,0.022)',
      border: '1px solid rgba(200,160,80,0.1)',
      borderRadius: '16px',
      padding: isMobile ? '1.5rem 1.2rem' : '2.5rem',
      position: 'relative', overflow: 'hidden',
    },
    sampleH2: {
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: '1.05rem', color: '#c8a050',
      marginBottom: '0.8rem', paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(200,160,80,0.1)',
      fontWeight: 600,
    },
    sampleP: {
      color: '#7a6e5e', lineHeight: 1.85,
      fontSize: '0.87rem', marginBottom: '1.5rem',
      fontFamily: "'Lora',Georgia,serif",
    },
    sampleCaption: {
      textAlign: 'center', marginTop: '1.5rem',
      fontSize: '0.76rem', color: '#3a3028',
      fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic',
    },

    // Final CTA
    ctaSection: {
      padding: isMobile ? '4rem 1.5rem' : '8rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid rgba(200,160,80,0.05)',
    },
    ctaTitle: {
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? 'clamp(2rem,7vw,2.8rem)' : 'clamp(2.4rem,5vw,3.8rem)',
      fontWeight: 400, color: '#e8dfc8',
      marginBottom: '1rem', lineHeight: 1.2,
    },
    ctaSub: {
      fontSize: '0.88rem', color: '#6a6050',
      fontFamily: "'Lora',Georgia,serif",
      maxWidth: '420px', margin: '0 auto 2.5rem',
      lineHeight: 1.7,
    },
    ctaFinalBtn: {
      padding: isMobile ? '1rem 2.2rem' : '1.1rem 2.8rem',
      background: 'linear-gradient(135deg,#c8a050,#9a7830)',
      border: 'none', borderRadius: '999px', color: '#0a0805',
      fontFamily: "'Cormorant Garamond',Georgia,serif",
      fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700,
      cursor: 'pointer', letterSpacing: '0.04em',
      boxShadow: '0 4px 32px rgba(200,160,80,0.22)',
      transition: 'all 0.2s',
    },

    // Footer
    footer: {
      padding: '1.8rem 2rem',
      textAlign: 'center', color: '#2e2820',
      fontSize: '0.76rem', fontFamily: "'Lora',Georgia,serif",
      borderTop: '1px solid rgba(255,255,255,0.025)',
    },
  }

  return (
    <div style={s.page}>

      {/* ── Nav ── */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <MMCircle size={28} />
          {isMobile ? 'Mystic Madman' : 'Mystic Madman'}
        </div>
        <button style={s.navSignIn}
          onClick={() => navigate('/auth')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,80,0.5)'; e.currentTarget.style.color = '#c8a050' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,80,0.25)'; e.currentTarget.style.color = '#9a7830' }}>
          Sign In
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={s.heroOuter}>
        <div style={s.heroGlow} />
        <div style={s.heroInner}>
          <MMCircle size={isMobile ? 64 : 80} />
          <div style={{ height: isMobile ? '1.5rem' : '2rem' }} />
          <p style={s.eyebrow}>Holistic AI life coach</p>
          <h1 style={s.heroTitle}>
            Part oracle.<br />
            <span style={s.heroTitleItalic}>Part mirror.</span><br />
            Entirely yours.
          </h1>
          <p style={s.heroPara}>
            A holistic AI coach that weaves the inner and the outer into a seamless whole of who you are right now, and what to do about it, in becoming the person you are destined to be.
          </p>
          <div style={s.heroCtas}>
            <button style={s.ctaPrimary}
              onClick={() => navigate('/auth')}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 32px rgba(200,160,80,0.35)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(200,160,80,0.2)'}>
              Begin your session →
            </button>
            <button style={s.ctaSecondary}
              onClick={scrollToDomains}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,80,0.4)'; e.currentTarget.style.color = '#9a7830' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,80,0.2)'; e.currentTarget.style.color = '#6a6050' }}>
              See how it works ↓
            </button>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* ── Six Domains ── */}
      <section style={s.domainsSection} ref={domainsRef}>
        <p style={s.sectionEyebrow}>Six domains, one truth</p>
        <h2 style={s.sectionTitle}>Everything that shapes you,<br />seen whole</h2>
        <div style={s.domainsGrid}>
          {DOMAINS.map(d => (
            <div key={d.title} style={s.domainCard}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(200,160,80,0.2)'
                e.currentTarget.style.background = 'rgba(200,160,80,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(200,160,80,0.07)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.012)'
              }}>
              <div style={s.domainIcon}>{d.icon}</div>
              <div>
                <div style={s.domainTitle}>{d.title}</div>
                <div style={s.domainDesc}>{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* ── Sample Reading ── */}
      <section style={s.sampleSection}>
        <p style={s.sectionEyebrow}>A glimpse inside</p>
        <h2 style={{ ...s.sectionTitle, marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>What a session looks like</h2>
        <div style={s.sampleCard}>
          <div style={s.sampleH2}>🌿 Overall State of Being</div>
          <p style={s.sampleP}>
            There is a quiet tension running through you right now — a coexistence of expansion and contraction that is not confusion, but the natural pressure of becoming. Your body is carrying the weight of ideas not yet grounded, and your dreams are showing you the symbols of transition: doorways, water, movement without a clear destination.
          </p>
          <div style={s.sampleH2}>🔮 Dream Insights</div>
          <p style={s.sampleP}>
            The recurring water imagery is significant. In the symbolic language of the psyche, water represents the emotional body — its depth, its current, its capacity to both nourish and overwhelm. You are not drowning in these dreams; you are learning to <strong style={{ color: '#c8a050', fontWeight: 500 }}>navigate</strong>. The doorways suggest a decision is crystallising in the unconscious before it surfaces into waking awareness — trust the timing.
          </p>
          {/* Fade-out overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '90px',
            background: 'linear-gradient(to bottom, transparent, #0a0805)',
            borderRadius: '0 0 16px 16px',
            pointerEvents: 'none',
          }} />
        </div>
        <p style={s.sampleCaption}>
          Sessions draw on everything you share — your body, your dreams, your chart, your numbers.
        </p>
      </section>

      <div style={s.divider} />

      {/* ── Final CTA ── */}
      <section style={s.ctaSection}>
        <p style={{ ...s.eyebrow, marginBottom: '1rem' }}>Your first session is free</p>
        <h2 style={s.ctaTitle}>Begin your first session</h2>
        <p style={s.ctaSub}>
          No commitment. No algorithm. Just a session that sees you whole.
        </p>
        <button style={s.ctaFinalBtn}
          onClick={() => navigate('/auth')}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 40px rgba(200,160,80,0.35)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 32px rgba(200,160,80,0.22)'}>
          Create your account →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        © 2025 Mystic Madman. All rights reserved.
      </footer>

    </div>
  )
}
