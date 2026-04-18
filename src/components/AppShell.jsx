import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { DashboardIcon, PlusIcon, ClockIcon, BellIcon, ChevronDownIcon, UserIcon, MenuIcon } from './Icons'

const LIFE_AREAS_NAV = [
  { icon: '❤️', label: 'Love & Relationships' },
  { icon: '💼', label: 'Work & Purpose' },
  { icon: '🫀', label: 'Health & Body' },
  { icon: '🧠', label: 'Mind & Emotions' },
  { icon: '🏠', label: 'Home & Family' },
  { icon: '🌱', label: 'Growth & Change' },
]
const OUTER_NAV = [
  { icon: '🏃', label: 'Physical Practice' },
  { icon: '🍃', label: 'Nutrition & Protocols' },
  { icon: '💰', label: 'Money & Finances' },
  { icon: '🎨', label: 'Creative Practice' },
  { icon: '🧘', label: 'Contemplative' },
  { icon: '🤝', label: 'Social & Community' },
]
const INNER_NAV = [
  { icon: '🌙', label: 'Dreams' },
  { icon: '✨', label: 'Astrology' },
  { icon: '🔢', label: 'Numerology' },
  { icon: '🔮', label: 'Intuitive' },
  { icon: '🃏', label: 'Tarot & Oracle' },
  { icon: '☯️', label: 'Human Design' },
  { icon: '🌑', label: 'Shadow Work' },
  { icon: '🌿', label: 'Lunar & Cycles' },
]

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/session', label: 'New Session', Icon: PlusIcon },
  { path: '/readings', label: 'Past Sessions', Icon: ClockIcon },
]

export default function AppShell({ session, pageName, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userConfig, setUserConfig] = useState(null)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    supabase.from('user_configuration').select('preferred_name,full_name,onboarding_skipped').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setUserConfig(data))
  }, [session])

  useEffect(() => {
    const close = () => setDropdownOpen(false)
    if (dropdownOpen) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [dropdownOpen])

  const firstName = userConfig?.preferred_name || userConfig?.full_name?.split(' ')[0] || ''
  const initials = firstName ? firstName.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const isActive = (path) => location.pathname === path

  // ── Styles ──────────────────────────────────────
  const C = {
    bg: '#141008', surface: '#1c1610', elevated: '#231e14',
    barBg: '#0f0c08', border: 'rgba(255,255,255,0.06)', borderMed: 'rgba(255,255,255,0.1)',
    gold: '#c8a050', goldMuted: '#9a7830', goldFaint: 'rgba(200,160,80,0.08)',
    text: '#f0e6c8', textSec: '#a09070', textMuted: '#5a5040', textDim: '#3a3020',
  }

  // ── Desktop ─────────────────────────────────────
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
        {/* Scrollbar styles */}
        <style>{`
          *::-webkit-scrollbar { width: 4px; height: 4px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: ${C.goldMuted}; border-radius: 4px; }
          * { scrollbar-width: thin; scrollbar-color: ${C.goldMuted} transparent; }
        `}</style>

        {/* ── Top Bar ── */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', background: C.barBg,
          borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            {/* MM monogram */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: C.goldFaint, border: `1.5px solid rgba(200,160,80,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }} onClick={() => navigate('/dashboard')}>
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.82rem', fontWeight: 700, color: C.gold }}>MM</span>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.05rem', fontWeight: 500, color: C.gold, letterSpacing: '0.03em', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Mystic Madman</span>
            {pageName && (
              <>
                <span style={{ color: C.textDim, margin: '0 0.2rem' }}>·</span>
                <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textMuted }}>{pageName}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {firstName && (
              <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', color: C.textMuted, fontStyle: 'italic' }}>
                {greeting}, {firstName}
              </span>
            )}
            <div style={{ position: 'relative', color: C.textMuted, cursor: 'pointer' }}>
              <BellIcon size={16} />
            </div>
            {/* Avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: C.goldFaint, border: `1px solid rgba(200,160,80,0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: '0.82rem', fontWeight: 700, color: C.gold,
                }}
                onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              >{initials}</div>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 40, right: 0, width: 180,
                  background: C.elevated, border: `1px solid ${C.borderMed}`, borderRadius: 8,
                  padding: '0.4rem 0', zIndex: 100,
                }}>
                  {[
                    { label: 'Profile', action: () => navigate('/profile') },
                    { label: 'Settings', action: null, disabled: true },
                    { label: 'Sign Out', action: () => supabase.auth.signOut() },
                  ].map(item => (
                    <button key={item.label} disabled={item.disabled}
                      onClick={item.action}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5rem 1rem', background: 'none', border: 'none',
                        fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem',
                        color: item.disabled ? C.textDim : C.text,
                        cursor: item.disabled ? 'default' : 'pointer',
                        opacity: item.disabled ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                    >
                      {item.label}{item.disabled ? ' (soon)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Sidebar ── */}
          <aside style={{
            width: 220, flexShrink: 0, background: C.barBg,
            borderRight: `1px solid rgba(255,255,255,0.05)`,
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
            padding: '1.2rem 0 1rem',
          }}>
            <SidebarSection label="Navigation">
              {NAV_ITEMS.map(n => (
                <SidebarItem key={n.path} active={isActive(n.path)} onClick={() => navigate(n.path)} C={C}>
                  <n.Icon size={15} color={isActive(n.path) ? C.gold : C.textMuted} />
                  <span>{n.label}</span>
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSection label="My Domains">
              {LIFE_AREAS_NAV.map(a => (
                <SidebarItem key={a.label} C={C}>
                  <span style={{ fontSize: '0.85rem' }}>{a.icon}</span>
                  <span>{a.label}</span>
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSection label="The Outer">
              {OUTER_NAV.map(l => (
                <SidebarItem key={l.label} C={C}>
                  <span style={{ fontSize: '0.85rem' }}>{l.icon}</span>
                  <span>{l.label}</span>
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSection label="The Inner">
              {INNER_NAV.map(l => (
                <SidebarItem key={l.label} C={C}>
                  <span style={{ fontSize: '0.85rem' }}>{l.icon}</span>
                  <span>{l.label}</span>
                </SidebarItem>
              ))}
            </SidebarSection>

            <div style={{ marginTop: 'auto', padding: '1rem 1rem 0.6rem', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: C.goldFaint,
                  border: `1px solid rgba(200,160,80,0.2)`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: '0.72rem', fontWeight: 700, color: C.gold,
                }}>{initials}</div>
                <div>
                  <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.text }}>{firstName || 'Profile'}</div>
                  {userConfig?.onboarding_skipped && (
                    <div style={{ fontSize: '0.65rem', color: C.goldMuted, fontFamily: "'Lora',Georgia,serif" }}>Complete profile</div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: C.bg }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ── Mobile ──────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg }}>
      <style>{`
        *::-webkit-scrollbar { width: 4px; height: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${C.goldMuted}; border-radius: 4px; }
        * { scrollbar-width: thin; scrollbar-color: ${C.goldMuted} transparent; }
      `}</style>

      {/* Mobile top bar */}
      <header style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', background: C.barBg,
        borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: C.goldFaint, border: `1.5px solid rgba(200,160,80,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.72rem', fontWeight: 700, color: C.gold }}>MM</span>
          </div>
          {pageName && <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textMuted }}>{pageName}</span>}
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: C.goldFaint, border: `1px solid rgba(200,160,80,0.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: '0.72rem', fontWeight: 700, color: C.gold,
            }}
            onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
          >{initials}</div>
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 38, right: 0, width: 160,
              background: C.elevated, border: `1px solid ${C.borderMed}`, borderRadius: 8,
              padding: '0.3rem 0', zIndex: 100,
            }}>
              {[
                { label: 'Profile', action: () => navigate('/profile') },
                { label: 'Sign Out', action: () => supabase.auth.signOut() },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.5rem 0.9rem', background: 'none', border: 'none',
                    fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', color: C.text, cursor: 'pointer',
                  }}
                >{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1rem 1rem 5.5rem', background: C.bg }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 60, paddingBottom: 'env(safe-area-inset-bottom)',
        background: C.barBg, borderTop: `1px solid rgba(255,255,255,0.05)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 50,
      }}>
        {[
          { path: '/dashboard', label: 'Home', Icon: DashboardIcon },
          { path: '/session', label: 'Session', Icon: PlusIcon },
          { path: '/readings', label: 'Sessions', Icon: ClockIcon },
          { path: '/profile', label: 'Profile', Icon: UserIcon },
        ].map(t => {
          const active = isActive(t.path)
          return (
            <button key={t.path} onClick={() => navigate(t.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? C.gold : C.textMuted, padding: '0.3rem 0.6rem',
                minWidth: 56,
              }}>
              <t.Icon size={18} color={active ? C.gold : C.textMuted} />
              <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.62rem', letterSpacing: '0.04em' }}>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── Sidebar helpers ─────────────────────────────────
function SidebarSection({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        fontFamily: "'Lora',Georgia,serif", fontSize: '0.62rem', fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a7830',
        padding: '0 1.1rem', marginBottom: '0.4rem',
      }}>{label}</div>
      {children}
    </div>
  )
}

function SidebarItem({ active, onClick, children, C }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.42rem 1.1rem',
        fontFamily: "'Lora',Georgia,serif", fontSize: '0.8rem',
        color: active ? C.gold : C.text,
        background: active ? C.goldFaint : hovered ? 'rgba(255,255,255,0.025)' : 'transparent',
        borderLeft: active ? `3px solid ${C.gold}` : '3px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
    >{children}</div>
  )
}
