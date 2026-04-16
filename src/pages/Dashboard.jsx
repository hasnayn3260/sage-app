import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import AppShell from '../components/AppShell'
import { ArrowRightIcon } from '../components/Icons'

const BANNER_DISMISS_KEY = 'mm_onboarding_banner_dismissed'

function calcPersonalYear(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  const currentYear = new Date().getFullYear()
  const digits = `${d}${m}${currentYear}`.split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0)
  }
  return sum
}

const PY_MEANINGS = {
  1: 'New beginnings and fresh starts',
  2: 'Partnership and patience',
  3: 'Creativity and self-expression',
  4: 'Building solid foundations',
  5: 'Change, freedom and adventure',
  6: 'Love, responsibility and home',
  7: 'Inner work and spiritual growth',
  8: 'Power, abundance and achievement',
  9: 'Completion and letting go',
  11: 'Spiritual awakening and illumination',
  22: 'Master builder — turning dreams to reality',
}

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [userConfig, setUserConfig] = useState(null)
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(() => !!sessionStorage.getItem(BANNER_DISMISS_KEY))

  useEffect(() => {
    const load = async () => {
      const [{ data: config }, { data: prof }, { data: sess }] = await Promise.all([
        supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setUserConfig(config)
      setProfile(prof)
      setSessions(sess || [])
      setLoading(false)
    }
    load()
  }, [session])

  const dismissBanner = () => { sessionStorage.setItem(BANNER_DISMISS_KEY, '1'); setBannerDismissed(true) }
  const firstName = userConfig?.preferred_name || userConfig?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const showBanner = !bannerDismissed && (!userConfig || userConfig.onboarding_skipped === true)

  const dob = userConfig?.date_of_birth || profile?.date_of_birth
  const personalYear = calcPersonalYear(dob)
  const sunSign = profile?.sun_sign

  const C = {
    bg: '#141008', surface: '#1c1610', elevated: '#231e14',
    border: 'rgba(255,255,255,0.06)', borderGold: 'rgba(200,160,80,0.25)',
    gold: '#c8a050', goldMuted: '#9a7830', goldFaint: 'rgba(200,160,80,0.08)',
    text: '#f0e6c8', textSec: '#a09070', textMuted: '#5a5040',
  }

  if (loading) return (
    <AppShell session={session} pageName="Dashboard">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.4rem', fontWeight: 700, color: C.gold, animation: 'pulse 2s infinite' }}>MM</div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
      </div>
    </AppShell>
  )

  return (
    <AppShell session={session} pageName="Dashboard">
      {/* ── Greeting ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 300, color: C.text, marginBottom: '0.3rem' }}>
          {greeting}, {firstName}.
        </h1>
        <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.9rem', color: C.textSec, fontStyle: 'italic' }}>
          What would you like to explore today?
        </p>
        {(personalYear || sunSign) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
            {personalYear && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.8rem', borderRadius: '999px',
                background: C.goldFaint, border: `1px solid ${C.borderGold}`,
                fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.gold,
              }}>
                Personal Year {personalYear} — {PY_MEANINGS[personalYear] || ''}
              </span>
            )}
            {sunSign && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.8rem', borderRadius: '999px',
                background: C.goldFaint, border: `1px solid ${C.borderGold}`,
                fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.gold,
              }}>☉ {sunSign}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Onboarding banner ── */}
      {showBanner && (
        <div style={{
          background: C.goldFaint, border: `1px solid ${C.borderGold}`, borderRadius: 12,
          padding: '0.85rem 1.2rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.6rem',
        }}>
          <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', color: C.text }}>
            Complete your foundation for deeper, more personalised sessions
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => navigate('/onboarding')} style={{
              padding: '0.4rem 1rem', background: `linear-gradient(135deg,${C.gold},${C.goldMuted})`,
              border: 'none', borderRadius: 999, color: '#0f0c08',
              fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}>Continue →</button>
            <button onClick={dismissBanner} style={{
              background: 'none', border: 'none', color: C.textMuted,
              fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', cursor: 'pointer',
            }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* ── Quick Action Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {/* Begin New Session */}
        <ActionCard primary onClick={() => navigate('/session')} C={C}>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.15rem', fontWeight: 600, color: '#0f0c08', marginBottom: '0.25rem' }}>Begin New Session</div>
          <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: 'rgba(15,12,8,0.65)' }}>Start a fresh reading</div>
          <ArrowRightIcon size={16} color="rgba(15,12,8,0.5)" style={{ position: 'absolute', bottom: 12, right: 14 }} />
        </ActionCard>

        {/* Continue Journey */}
        <ActionCard onClick={() => navigate('/readings')} C={C}>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: '0.25rem' }}>Continue Journey</div>
          <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textSec }}>
            {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} completed` : 'View past sessions'}
          </div>
        </ActionCard>

        {/* Conditional third card */}
        <ActionCard onClick={() => navigate(userConfig?.onboarding_skipped ? '/onboarding' : '/profile')} C={C}>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: '0.25rem' }}>
            {userConfig?.onboarding_skipped ? 'Complete Your Profile' : 'View Profile'}
          </div>
          <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textSec }}>
            {userConfig?.onboarding_skipped ? 'Deepen your readings' : 'Your foundation settings'}
          </div>
        </ActionCard>
      </div>

      {/* ── Recent Sessions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.1rem', fontWeight: 600, color: C.text }}>Recent Sessions</h2>
        {sessions.length > 0 && (
          <span onClick={() => navigate('/readings')} style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.textSec, cursor: 'pointer' }}>View all →</span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem 2rem',
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
        }}>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.3rem', fontWeight: 700, color: C.gold, marginBottom: '0.6rem', letterSpacing: '0.04em' }}>MM</div>
          <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.88rem', color: C.textSec, fontStyle: 'italic', marginBottom: '1.2rem' }}>
            Your journey begins with a single session
          </p>
          <button onClick={() => navigate('/session')} style={{
            padding: '0.65rem 1.6rem', background: `linear-gradient(135deg,${C.gold},${C.goldMuted})`,
            border: 'none', borderRadius: 999, color: '#0f0c08',
            fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          }}>Begin your first session →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sessions.map(sess => (
            <div key={sess.id} onClick={() => navigate('/readings')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '0.85rem 1.1rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,160,80,0.18)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div>
                <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.87rem', color: C.text, marginBottom: '0.15rem' }}>{sess.title || 'Holistic Session'}</div>
                <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem', color: C.textMuted }}>{formatDate(sess.created_at)}</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: C.textMuted }}>View →</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Daily Wisdom ── */}
      <div style={{
        marginTop: '2.5rem', padding: '1.3rem 1.5rem',
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      }}>
        <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.05rem', fontWeight: 400, fontStyle: 'italic', color: C.text, lineHeight: 1.65, marginBottom: '0.6rem' }}>
          "The privilege of a lifetime is to become who you truly are."
        </p>
        <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.textMuted }}>— C.G. Jung</p>
      </div>
    </AppShell>
  )
}

function ActionCard({ primary, onClick, children, C }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: primary ? `linear-gradient(135deg,${C.gold},${C.goldMuted})` : C.surface,
        border: `1px solid ${hovered ? (primary ? 'transparent' : 'rgba(200,160,80,0.22)') : (primary ? 'transparent' : C.border)}`,
        borderRadius: 12, padding: '1.3rem 1.2rem', cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
      {children}
    </div>
  )
}
