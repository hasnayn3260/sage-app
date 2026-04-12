import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  SPIRITUAL_ORIENTATIONS, TRADITION_REVEAL, TRADITIONS_T1, TRADITIONS_T2,
  ESOTERIC_OPENNESS, PURPOSE_VIEWS, CHANGE_APPROACHES, DECISION_TRUSTS, PILLARS,
  GENDERS, sanitizeForDB, normalizeFromDB,
} from './onboardingConfig'

// ── MM Monogram ─────────────────────────────────────
function MMCircle({ size = 48, pulse = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(200,160,80,0.08)',
      border: '1.5px solid rgba(200,160,80,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto',
      boxShadow: '0 0 32px rgba(200,160,80,0.07)',
      animation: pulse ? 'mmPulse 2.4s ease-in-out infinite' : 'none',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: size * 0.3, fontWeight: 700,
        color: '#c8a050', letterSpacing: '0.03em',
      }}>MM</span>
      {pulse && <style>{`@keyframes mmPulse{0%,100%{box-shadow:0 0 24px rgba(200,160,80,0.08)}50%{box-shadow:0 0 48px rgba(200,160,80,0.22)}}`}</style>}
    </div>
  )
}

// ── Progress Indicator ──────────────────────────────
function ProgressPips({ current, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const isCurrent = n === current
        const isDone = n < current
        return (
          <div key={n} style={{
            width: isCurrent ? '28px' : '18px',
            height: '3px', borderRadius: '2px',
            background: isCurrent ? '#c8a050' : isDone ? 'rgba(154,120,48,0.5)' : 'rgba(255,255,255,0.06)',
            transition: 'all 0.3s',
          }} />
        )
      })}
    </div>
  )
}

// ── Shared styles helpers ───────────────────────────
const cardStyle = (selected) => ({
  background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
  border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '12px',
  padding: '1.1rem 1.2rem',
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: selected ? '0 0 20px rgba(200,160,80,0.1)' : 'none',
})

// ── Main Component ──────────────────────────────────
export default function Onboarding({ session, onConfigSaved }) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [step, setStep] = useState('welcome') // 'welcome' | 1-5 | 'complete'
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [config, setConfig] = useState({
    full_name: '', current_name: '', date_of_birth: '', time_of_birth: '',
    birth_place: '', preferred_name: '', gender: '',
    spiritual_orientation: '', tradition_tier1: '', tradition_tier2: '', esoteric_openness: '',
    purpose_view: '', change_approach: '', decision_trust: '',
    pillars: [],
    vision_5year: '', vision_change: '', vision_gift: '',
    shadow_pattern: '', shadow_fear: '', shadow_admit: '',
  })

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Load existing config if user returns to onboarding
  useEffect(() => {
    supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle()
      .then(({ data, error }) => {
        console.log('[Onboarding] load result:', { data, error })
        if (data) setConfig(prev => ({ ...prev, ...normalizeFromDB(data) }))
      })
  }, [session])

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))

  const writeConfig = async (extra = {}, tag = 'write') => {
    const payload = { ...sanitizeForDB(config), ...extra, user_id: session.user.id }
    console.log(`[Onboarding] ${tag} upserting payload:`, payload)
    const { data, error } = await supabase
      .from('user_configuration')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
    if (error) {
      console.error(`[Onboarding] ${tag} — FULL ERROR OBJECT:`, error)
      console.error(`[Onboarding] ${tag} — error.message:`, error.message)
      console.error(`[Onboarding] ${tag} — error.details:`, error.details)
      console.error(`[Onboarding] ${tag} — error.hint:`, error.hint)
      console.error(`[Onboarding] ${tag} — error.code:`, error.code)
      console.error(`[Onboarding] ${tag} — JSON:`, JSON.stringify(error, null, 2))
    } else {
      console.log(`[Onboarding] ${tag} upsert OK, returned rows:`, data)
    }
    return { data, error }
  }

  // One-time diagnostic probe on mount — a safe SELECT that tells us
  // immediately whether the table exists and RLS lets us read.
  useEffect(() => {
    (async () => {
      console.log('[Onboarding] diagnostic probe starting...')
      const { data, error } = await supabase
        .from('user_configuration')
        .select('user_id')
        .eq('user_id', session.user.id)
      console.log('[Onboarding] probe result:', { data, error })
      if (error) {
        console.error('[Onboarding] probe ERROR — this is likely the same cause as the save failures:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
      }
    })()
  }, [session])

  const savePartial = async (extra = {}) => {
    setLoading(true)
    const { error } = await writeConfig(extra, 'savePartial')
    setLoading(false)
    if (error) console.error('[Onboarding] savePartial failed:', error)
  }

  const goStep = (next) => {
    setTransitioning(true)
    setTimeout(() => {
      setStep(next)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 180)
  }

  const handleWelcomeBegin = () => goStep(1)

  // Unified exit: creates/updates a user_configuration record marked as
  // skipped so the app stops redirecting to /onboarding. Preserves any
  // partial data the user has entered. Only navigates after the DB
  // write is confirmed.
  const handleExitSkip = async () => {
    console.log('[Onboarding] handleExitSkip clicked')
    setLoading(true)
    const { error } = await writeConfig({
      onboarding_completed: false,
      onboarding_skipped: true,
    }, 'handleExitSkip')
    if (error) {
      const detail = [
        `Message: ${error.message || '(none)'}`,
        `Code: ${error.code || '(none)'}`,
        `Details: ${error.details || '(none)'}`,
        `Hint: ${error.hint || '(none)'}`,
      ].join('\n')
      alert(`Save failed — Supabase returned:\n\n${detail}\n\nFull error object is in browser console.`)
      setLoading(false)
      return
    }
    console.log('[Onboarding] skip saved, refreshing App config state')
    if (onConfigSaved) await onConfigSaved()
    console.log('[Onboarding] navigating to /dashboard')
    setLoading(false)
    navigate('/dashboard')
  }

  const handleNext = async () => {
    await savePartial()
    if (step < 5) goStep(step + 1)
    else handleComplete()
  }

  const handleBack = () => {
    if (step === 1) goStep('welcome')
    else goStep(step - 1)
  }

  const handleComplete = async () => {
    console.log('[Onboarding] handleComplete clicked')
    setLoading(true)
    const { error } = await writeConfig({
      onboarding_completed: true,
      onboarding_skipped: false,
      completed_at: new Date().toISOString(),
    }, 'handleComplete')
    if (error) {
      const detail = [
        `Message: ${error.message || '(none)'}`,
        `Code: ${error.code || '(none)'}`,
        `Details: ${error.details || '(none)'}`,
        `Hint: ${error.hint || '(none)'}`,
      ].join('\n')
      alert(`Save failed — Supabase returned:\n\n${detail}\n\nFull error object is in browser console.`)
      setLoading(false)
      return
    }
    if (onConfigSaved) await onConfigSaved()
    setLoading(false)
    goStep('complete')
  }

  // ── Styles ──────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, rgba(200,160,80,0.03) 0%, transparent 60%), #0a0805', color: '#e8dfc8' },
    topBar: { padding: isMobile ? '1.5rem 1rem 1rem' : '1.8rem 2rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
    topLogo: { display: 'flex', alignItems: 'center', gap: '0.55rem', fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a050', fontSize: isMobile ? '0.92rem' : '1rem', letterSpacing: '0.03em' },
    topMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(200,160,80,0.1)', border: '1px solid rgba(200,160,80,0.25)', fontSize: '0.56rem', fontWeight: 700, color: '#c8a050', fontFamily: "'Cormorant Garamond',Georgia,serif", flexShrink: 0 },
    exitLink: { background: 'none', border: 'none', color: '#5a5040', fontSize: '0.76rem', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" },

    body: { maxWidth: '720px', margin: '0 auto', padding: isMobile ? '1rem 1.25rem 4rem' : '1.5rem 2rem 5rem', opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.22s ease, transform 0.22s ease' },

    // Welcome
    welcomeWrap: { minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: isMobile ? '2rem 1.5rem' : '3rem 2rem', maxWidth: '640px', margin: '0 auto' },
    welcomeTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 'clamp(1.9rem,6vw,2.4rem)' : 'clamp(2.4rem,5vw,3.2rem)', fontWeight: 400, color: '#e8dfc8', lineHeight: 1.18, marginTop: '2rem', marginBottom: '1.5rem', letterSpacing: '-0.005em' },
    welcomeText: { fontSize: isMobile ? '0.92rem' : '1rem', color: '#7a6e5e', lineHeight: 1.8, fontFamily: "'Lora',Georgia,serif", marginBottom: '2.5rem', maxWidth: '520px' },
    welcomeBtns: { display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', maxWidth: '320px' },

    // Step shell
    stepHead: { textAlign: 'center', marginBottom: isMobile ? '1.8rem' : '2.4rem' },
    stepTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 'clamp(1.6rem,5.5vw,2rem)' : 'clamp(2rem,4vw,2.5rem)', fontWeight: 500, color: '#e8dfc8', marginBottom: '0.5rem', lineHeight: 1.2, letterSpacing: '-0.005em' },
    stepSub: { fontSize: isMobile ? '0.85rem' : '0.92rem', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto' },

    // Inputs
    field: { marginBottom: '1.4rem' },
    label: { display: 'block', fontSize: '0.72rem', color: '#9a7830', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: "'Lora',Georgia,serif" },
    input: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#e8dfc8', fontSize: '0.92rem', outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box' },
    hint: { fontSize: '0.75rem', color: '#5a5040', fontStyle: 'italic', marginTop: '0.35rem', fontFamily: "'Lora',Georgia,serif" },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '10px', padding: '0.9rem 1rem', color: '#e8dfc8', fontSize: '0.92rem', lineHeight: 1.75, outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box', resize: 'vertical', minHeight: '120px' },

    // Selectable cards (Q-style)
    questionBlock: { marginBottom: '2rem' },
    questionTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, color: '#e8dfc8', marginBottom: '1rem' },
    cardsStack: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
    cardsGrid2: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '0.6rem' },
    cardsGrid3: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '0.6rem' },
    cardIcon: { fontSize: '1.4rem', marginBottom: '0.55rem', lineHeight: 1 },
    cardTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? '0.92rem' : '0.98rem', fontWeight: 600, color: '#e8dfc8', marginBottom: '0.2rem', lineHeight: 1.25 },
    cardDesc: { fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#7a6e5e', lineHeight: 1.55, fontFamily: "'Lora',Georgia,serif" },

    // Pill cards (for esoteric openness)
    pillRow: { display: 'flex', gap: '0.55rem', flexWrap: 'wrap' },
    pill: (selected) => ({
      padding: '0.6rem 1.1rem',
      background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s',
      color: '#c8bfa8', fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem',
      boxShadow: selected ? '0 0 14px rgba(200,160,80,0.08)' : 'none',
    }),

    // Pillar card with rank badge
    pillarCard: (selected, rank) => ({
      ...cardStyle(selected),
      display: 'flex', alignItems: 'center', gap: '0.7rem',
      padding: '0.9rem 1rem',
      minHeight: '44px',
      position: 'relative',
    }),
    rankBadge: { position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#c8a050,#9a7830)', color: '#0a0805', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Cormorant Garamond',Georgia,serif", boxShadow: '0 2px 8px rgba(200,160,80,0.35)' },

    // Select with optgroups
    select: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#e8dfc8', fontSize: '0.9rem', outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1l5 5 5-5' stroke='%239a7830' stroke-width='1.5' fill='none'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' },

    // Disclaimer card
    disclaimer: { background: 'rgba(200,160,80,0.04)', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '10px', padding: '1.1rem 1.3rem', marginBottom: '2rem', fontSize: '0.87rem', color: '#9a8e78', lineHeight: 1.7, fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' },

    // Nav buttons
    navBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '2.5rem' },
    backBtn: { background: 'transparent', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '999px', padding: '0.7rem 1.3rem', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', cursor: 'pointer' },
    primaryBtn: { padding: isMobile ? '0.85rem 1.8rem' : '0.9rem 2.2rem', background: 'linear-gradient(135deg,#c8a050,#9a7830)', border: 'none', borderRadius: '999px', color: '#0a0805', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.98rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 20px rgba(200,160,80,0.18)', transition: 'all 0.2s' },
    ghostBtn: { padding: '0.85rem 1.8rem', background: 'transparent', border: '1.5px solid rgba(200,160,80,0.35)', borderRadius: '999px', color: '#c8a050', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' },
    skipLink: { display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: '#5a5040', fontSize: '0.78rem', fontFamily: "'Lora',Georgia,serif", cursor: 'pointer', textAlign: 'center', padding: '0.3rem 0.5rem' },
  }

  // ── Welcome Screen ──────────────────────────────
  if (step === 'welcome') {
    return (
      <div style={s.page}>
        <div style={s.welcomeWrap}>
          <MMCircle size={isMobile ? 68 : 84} />
          <h1 style={s.welcomeTitle}>Before your first session,<br />let's build your foundation.</h1>
          <p style={s.welcomeText}>
            This takes about 10 minutes. Everything here helps Sage know you — not just what you're going through, but who you are and where you're going. Nothing is mandatory. You can skip anything and come back later.
          </p>
          <div style={s.welcomeBtns}>
            <button style={s.primaryBtn} onClick={handleWelcomeBegin}>Begin →</button>
            <button style={s.skipLink} onClick={handleExitSkip} disabled={loading}>
              Skip for now — take me to my dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Completion Screen ───────────────────────────
  if (step === 'complete') {
    return (
      <div style={s.page}>
        <div style={s.welcomeWrap}>
          <MMCircle size={isMobile ? 72 : 92} pulse />
          <h1 style={s.welcomeTitle}>Your foundation is set.</h1>
          <p style={s.welcomeText}>
            Sage knows you now. Every session from here will be shaped by what you've shared — your beliefs, your vision, your shadows, your path.
          </p>
          <div style={s.welcomeBtns}>
            <button style={s.primaryBtn} onClick={() => navigate('/session')}>Begin my first session →</button>
            <button style={s.skipLink} onClick={() => navigate('/dashboard')}>Go to dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Top bar (shown on steps 1-5) ────────────────
  const topBar = (
    <div style={s.topBar}>
      <div style={s.topLogo}>
        <span style={s.topMM}>MM</span>Mystic Madman
      </div>
      <ProgressPips current={step} total={5} />
      <button style={s.exitLink} onClick={handleExitSkip} disabled={loading}>Exit</button>
    </div>
  )

  // ── Step 1: Identity ────────────────────────────
  if (step === 1) {
    return (
      <div style={s.page}>
        {topBar}
        <div style={s.body}>
          <div style={s.stepHead}>
            <h1 style={s.stepTitle}>Who are you?</h1>
            <p style={s.stepSub}>The basics used for gaining a deeper understanding as to life path</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>Full birth name</label>
            <input style={s.input} value={config.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full birth name" />
            <p style={s.hint}>As it appears on your birth certificate, used for numerology</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>Current name</label>
            <input style={s.input} value={config.current_name} onChange={e => set('current_name', e.target.value)} placeholder="The name you go by today" />
            <p style={s.hint}>The name you go by today, if different from your birth name</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>Date of birth</label>
            <input style={s.input} type="date" value={config.date_of_birth || ''} onChange={e => set('date_of_birth', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Time of Birth</label>
            <input style={s.input} type="time" value={config.time_of_birth || ''} onChange={e => set('time_of_birth', e.target.value)} />
            <p style={s.hint}>As accurate as possible — used for astrological rising sign calculation. Check your birth certificate if unsure.</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>Place of birth</label>
            <input style={s.input} value={config.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="City, Country" />
            <p style={s.hint}>City and country</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>How you like to be addressed</label>
            <input style={s.input} value={config.preferred_name} onChange={e => set('preferred_name', e.target.value)} placeholder="What should Sage call you?" />
            <p style={s.hint}>What should Sage call you?</p>
          </div>

          <div style={s.field}>
            <label style={s.label}>Gender</label>
            <div style={s.pillRow}>
              {GENDERS.map(g => {
                const selected = config.gender === g.id
                return (
                  <button key={g.id} type="button" style={s.pill(selected)} onClick={() => set('gender', selected ? '' : g.id)}>
                    {g.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={s.navBar}>
            <button style={s.backBtn} onClick={handleBack}>← Back</button>
            <button style={s.primaryBtn} onClick={handleNext} disabled={loading}>Continue →</button>
          </div>
          <button style={s.skipLink} onClick={handleExitSkip} disabled={loading}>Skip for now — take me to my dashboard</button>
        </div>
      </div>
    )
  }

  // ── Step 2: Spiritual Orientation ───────────────
  if (step === 2) {
    const showTradition = TRADITION_REVEAL.includes(config.spiritual_orientation)
    const tier2Groups = config.tradition_tier1 ? TRADITIONS_T2[config.tradition_tier1] : null

    return (
      <div style={s.page}>
        {topBar}
        <div style={s.body}>
          <div style={s.stepHead}>
            <h1 style={s.stepTitle}>How do you relate to the sacred?</h1>
            <p style={s.stepSub}>This helps Sage speak your language — skip entirely if you prefer</p>
          </div>

          {/* Orientation */}
          <div style={s.questionBlock}>
            <div style={s.questionTitle}>What best describes your spiritual orientation?</div>
            <div style={s.cardsStack}>
              {SPIRITUAL_ORIENTATIONS.map(opt => {
                const selected = config.spiritual_orientation === opt.id
                return (
                  <div key={opt.id} style={cardStyle(selected)} onClick={() => set('spiritual_orientation', selected ? '' : opt.id)}>
                    <div style={s.cardTitle}>{opt.title}</div>
                    {opt.desc && <div style={s.cardDesc}>{opt.desc}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tradition (conditional) */}
          {showTradition && (
            <div style={s.questionBlock} className="sage-fade-in">
              <div style={s.questionTitle}>Would you like to share your tradition?</div>
              <p style={{ ...s.cardDesc, marginBottom: '1rem' }}>This helps Sage speak within your framework.</p>
              <div style={s.cardsGrid3}>
                {TRADITIONS_T1.map(t => {
                  const selected = config.tradition_tier1 === t.id
                  return (
                    <div key={t.id} style={cardStyle(selected)} onClick={() => { const v = selected ? '' : t.id; set('tradition_tier1', v); if (!v) set('tradition_tier2', '') }}>
                      <div style={s.cardTitle}>{t.title}</div>
                      {t.desc && <div style={s.cardDesc}>{t.desc}</div>}
                    </div>
                  )
                })}
              </div>

              {tier2Groups && (
                <div style={{ marginTop: '1.2rem' }} className="sage-fade-in">
                  <label style={s.label}>Specific tradition</label>
                  <select style={s.select} value={config.tradition_tier2} onChange={e => set('tradition_tier2', e.target.value)}>
                    <option value="">General / Not specified</option>
                    {tier2Groups.map((g, i) => g.group ? (
                      <optgroup key={i} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ) : (
                      g.options.map(o => <option key={o} value={o}>{o}</option>)
                    ))}
                    <option value="__private">Prefer not to say</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Esoteric openness (always shown) */}
          <div style={s.questionBlock}>
            <div style={s.questionTitle}>How open are you to esoteric frameworks like astrology and numerology?</div>
            <div style={s.pillRow}>
              {ESOTERIC_OPENNESS.map(o => {
                const selected = config.esoteric_openness === o.id
                return (
                  <button key={o.id} style={s.pill(selected)} onClick={() => set('esoteric_openness', selected ? '' : o.id)}>
                    {o.title}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={s.navBar}>
            <button style={s.backBtn} onClick={handleBack}>← Back</button>
            <button style={s.primaryBtn} onClick={handleNext} disabled={loading}>Continue →</button>
          </div>
          <button style={s.skipLink} onClick={handleExitSkip} disabled={loading}>Skip for now — take me to my dashboard</button>
        </div>
      </div>
    )
  }

  // ── Step 3: Beliefs & Worldview ─────────────────
  if (step === 3) {
    const renderQuestion = (title, key, options) => (
      <div style={s.questionBlock}>
        <div style={s.questionTitle}>{title}</div>
        <div style={s.cardsStack}>
          {options.map(opt => {
            const selected = config[key] === opt.id
            return (
              <div key={opt.id} style={cardStyle(selected)} onClick={() => set(key, selected ? '' : opt.id)}>
                <div style={s.cardTitle}>{opt.title}</div>
                {opt.desc && <div style={s.cardDesc}>{opt.desc}</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
    return (
      <div style={s.page}>
        {topBar}
        <div style={s.body}>
          <div style={s.stepHead}>
            <h1 style={s.stepTitle}>How do you see the world?</h1>
            <p style={s.stepSub}>Your philosophy shapes the guidance Sage gives you</p>
          </div>
          {renderQuestion("What is your sense of life's purpose?", 'purpose_view', PURPOSE_VIEWS)}
          {renderQuestion('How do you approach change and growth?', 'change_approach', CHANGE_APPROACHES)}
          {renderQuestion('When you face a difficult decision, what do you trust most?', 'decision_trust', DECISION_TRUSTS)}
          <div style={s.navBar}>
            <button style={s.backBtn} onClick={handleBack}>← Back</button>
            <button style={s.primaryBtn} onClick={handleNext} disabled={loading}>Continue →</button>
          </div>
          <button style={s.skipLink} onClick={handleExitSkip} disabled={loading}>Skip for now — take me to my dashboard</button>
        </div>
      </div>
    )
  }

  // ── Step 4: Life Architecture ───────────────────
  if (step === 4) {
    const togglePillar = (id) => {
      setConfig(prev => {
        const current = prev.pillars || []
        if (current.includes(id)) {
          return { ...prev, pillars: current.filter(x => x !== id) }
        }
        if (current.length >= 5) return prev
        return { ...prev, pillars: [...current, id] }
      })
    }

    return (
      <div style={s.page}>
        {topBar}
        <div style={s.body}>
          <div style={s.stepHead}>
            <h1 style={s.stepTitle}>What are you building?</h1>
            <p style={s.stepSub}>Your vision and priorities — Sage will hold these in every reading</p>
          </div>

          <div style={s.questionBlock}>
            <div style={s.questionTitle}>Your Pillars</div>
            <p style={{ ...s.cardDesc, marginBottom: '1rem' }}>
              Which of these matter most to you right now? Select up to 5 and tap in order of importance — the number shows your ranking.
            </p>
            <div style={s.cardsGrid2}>
              {PILLARS.map(p => {
                const rank = (config.pillars || []).indexOf(p.id)
                const selected = rank !== -1
                return (
                  <div key={p.id} style={s.pillarCard(selected, rank + 1)} onClick={() => togglePillar(p.id)}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.95rem', fontWeight: 600, color: '#e8dfc8' }}>{p.title}</span>
                    {selected && <span style={s.rankBadge}>{rank + 1}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={s.questionBlock}>
            <div style={s.questionTitle}>Your Vision</div>

            <div style={s.field}>
              <label style={s.label}>In 5 years, what does your ideal life look like?</label>
              <p style={{ ...s.hint, marginTop: 0, marginBottom: '0.5rem' }}>Describe it as if it has already happened.</p>
              <textarea style={s.textarea} value={config.vision_5year} onChange={e => set('vision_5year', e.target.value)} placeholder="I am living in... I spend my days... The people around me... I feel..." rows={5} />
            </div>

            <div style={s.field}>
              <label style={s.label}>The single most important thing you want to change or create right now</label>
              <textarea style={s.textarea} value={config.vision_change} onChange={e => set('vision_change', e.target.value)} placeholder="The thing I most want to shift is..." rows={3} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Your greatest gift to the world</label>
              <textarea style={s.textarea} value={config.vision_gift} onChange={e => set('vision_gift', e.target.value)} placeholder="What I have to offer that is uniquely mine is..." rows={3} />
            </div>
          </div>

          <div style={s.navBar}>
            <button style={s.backBtn} onClick={handleBack}>← Back</button>
            <button style={s.primaryBtn} onClick={handleNext} disabled={loading}>Continue →</button>
          </div>
          <button style={s.skipLink} onClick={handleExitSkip} disabled={loading}>Skip for now — take me to my dashboard</button>
        </div>
      </div>
    )
  }

  // ── Step 5: Shadows ─────────────────────────────
  if (step === 5) {
    return (
      <div style={s.page}>
        {topBar}
        <div style={s.body}>
          <div style={s.stepHead}>
            <h1 style={s.stepTitle}>What lives in the shadow?</h1>
            <p style={s.stepSub}>
              This is the most optional section. These questions go deep — only answer what feels right. Sage holds this with care, never judgment.
            </p>
          </div>

          <div style={s.disclaimer}>
            What you share here never appears verbatim in your readings. It informs the depth of Sage's guidance — the things beneath the surface that quietly shape everything.
          </div>

          <div style={s.field}>
            <label style={s.label}>What pattern keeps repeating in your life that you want to break?</label>
            <textarea style={s.textarea} value={config.shadow_pattern} onChange={e => set('shadow_pattern', e.target.value)} placeholder="I keep finding myself..." rows={4} />
          </div>

          <div style={s.field}>
            <label style={s.label}>What fear most quietly limits you?</label>
            <textarea style={s.textarea} value={config.shadow_fear} onChange={e => set('shadow_fear', e.target.value)} placeholder="Beneath the surface, what I'm most afraid of is..." rows={4} />
          </div>

          <div style={s.field}>
            <label style={s.label}>What do you know about yourself that you find hard to admit?</label>
            <textarea style={s.textarea} value={config.shadow_admit} onChange={e => set('shadow_admit', e.target.value)} placeholder="If I'm really honest with myself..." rows={4} />
          </div>

          <div style={s.navBar}>
            <button style={s.backBtn} onClick={handleBack}>← Back</button>
            <button style={s.primaryBtn} onClick={handleComplete} disabled={loading}>
              {loading ? 'Saving...' : 'Complete my foundation →'}
            </button>
          </div>
          <button style={s.skipLink} onClick={handleComplete}>Skip shadows — finish setup</button>
        </div>
      </div>
    )
  }

  return null
}
