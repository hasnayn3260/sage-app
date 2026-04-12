import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  SPIRITUAL_ORIENTATIONS, TRADITION_REVEAL, TRADITIONS_T1, TRADITIONS_T2,
  ESOTERIC_OPENNESS, PURPOSE_VIEWS, CHANGE_APPROACHES, DECISION_TRUSTS, PILLARS,
  labelFor,
} from './onboardingConfig'

const EMPTY_CONFIG = {
  full_name: '', date_of_birth: '', birth_place: '', preferred_name: '',
  spiritual_orientation: '', tradition_tier1: '', tradition_tier2: '', esoteric_openness: '',
  purpose_view: '', change_approach: '', decision_trust: '',
  pillars: [],
  vision_5year: '', vision_change: '', vision_gift: '',
  shadow_pattern: '', shadow_fear: '', shadow_admit: '',
}

// ── Card helpers ──────────────────────────────────
const cardStyle = (selected) => ({
  background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
  border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '12px', padding: '1rem 1.1rem',
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: selected ? '0 0 16px rgba(200,160,80,0.08)' : 'none',
})

export default function Profile({ session }) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(EMPTY_CONFIG)
  const [openPanel, setOpenPanel] = useState(null) // which panel is expanded for edit
  const [savingPanel, setSavingPanel] = useState(null)
  const [panelMessage, setPanelMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [passwordSent, setPasswordSent] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle()
      if (data) setConfig({ ...EMPTY_CONFIG, ...data, pillars: data.pillars || [] })
      setLoading(false)
    }
    load()
  }, [session])

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))

  const saveSection = async (sectionId, fields) => {
    setSavingPanel(sectionId)
    setPanelMessage('')
    const patch = { user_id: session.user.id }
    fields.forEach(f => { patch[f] = config[f] })
    const { error } = await supabase.from('user_configuration').upsert(patch)
    setSavingPanel(null)
    if (error) setPanelMessage('Error saving — please try again')
    else {
      setPanelMessage('Saved ✓')
      setTimeout(() => { setPanelMessage(''); setOpenPanel(null) }, 1200)
    }
  }

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: window.location.origin + '/auth',
    })
    if (!error) setPasswordSent(true)
  }

  const handleDeleteAccount = async () => {
    const uid = session.user.id
    await supabase.from('user_configuration').delete().eq('user_id', uid)
    await supabase.from('sessions').delete().eq('user_id', uid)
    await supabase.from('profiles').delete().eq('id', uid)
    await supabase.auth.signOut()
  }

  // ── Styles ──────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: '#0a0805', color: '#e8dfc8' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.1rem 2rem', borderBottom: '1px solid rgba(200,160,80,0.07)', position: 'sticky', top: 0, background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(12px)', zIndex: 100 },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a050', fontSize: isMobile ? '0.95rem' : '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,160,80,0.1)', border: '1px solid rgba(200,160,80,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a050', fontFamily: "'Cormorant Garamond',Georgia,serif", flexShrink: 0 },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '999px', color: '#7a6e5e', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" },

    body: { maxWidth: '720px', margin: '0 auto', padding: isMobile ? '1.5rem 1rem 4rem' : '2.5rem 1.5rem 5rem' },
    header: { textAlign: 'center', marginBottom: '2rem' },
    title: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 'clamp(1.7rem,5vw,2rem)' : 'clamp(2rem,4vw,2.4rem)', fontWeight: 500, color: '#e8dfc8', marginBottom: '0.3rem' },
    subtitle: { fontSize: '0.82rem', color: '#7a6e5e', fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" },

    panel: (open) => ({
      background: open ? 'rgba(200,160,80,0.03)' : 'rgba(255,255,255,0.018)',
      border: `1px solid ${open ? 'rgba(200,160,80,0.22)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '12px', marginBottom: '0.7rem', overflow: 'hidden',
      transition: 'all 0.2s',
    }),
    panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '1rem 1.1rem' : '1.1rem 1.4rem', cursor: 'pointer' },
    panelTitle: { display: 'flex', alignItems: 'center', gap: '0.7rem', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? '1rem' : '1.08rem', color: '#e8dfc8', fontWeight: 600 },
    panelIcon: { fontSize: '1.1rem', lineHeight: 1 },
    panelEdit: { fontSize: '0.74rem', color: '#9a7830', fontFamily: "'Lora',Georgia,serif", letterSpacing: '0.06em', textTransform: 'uppercase' },
    panelBody: { padding: isMobile ? '0 1.1rem 1.2rem' : '0 1.4rem 1.5rem', borderTop: '1px solid rgba(200,160,80,0.08)', paddingTop: '1.2rem' },
    panelSummary: { padding: isMobile ? '0 1.1rem 1rem' : '0 1.4rem 1.1rem', fontSize: '0.84rem', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif", lineHeight: 1.7 },
    summaryKey: { color: '#9a7830', marginRight: '0.4rem' },

    // Fields
    field: { marginBottom: '1.1rem' },
    label: { display: 'block', fontSize: '0.71rem', color: '#9a7830', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: "'Lora',Georgia,serif" },
    input: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '8px', padding: '0.75rem 0.95rem', color: '#e8dfc8', fontSize: '0.9rem', outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '10px', padding: '0.85rem 0.95rem', color: '#e8dfc8', fontSize: '0.9rem', lineHeight: 1.75, outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box', resize: 'vertical', minHeight: '100px' },
    select: { width: '100%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,160,80,0.12)', borderRadius: '8px', padding: '0.72rem 1rem', color: '#e8dfc8', fontSize: '0.88rem', outline: 'none', fontFamily: "'Lora',Georgia,serif", boxSizing: 'border-box', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1l5 5 5-5' stroke='%239a7830' stroke-width='1.5' fill='none'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' },

    questionBlock: { marginBottom: '1.5rem' },
    questionTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.95rem', fontWeight: 600, color: '#e8dfc8', marginBottom: '0.7rem' },
    cardsStack: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    cardsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '0.5rem' },
    cardTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.92rem', fontWeight: 600, color: '#e8dfc8', marginBottom: '0.15rem' },
    cardDesc: { fontSize: '0.77rem', color: '#7a6e5e', lineHeight: 1.55, fontFamily: "'Lora',Georgia,serif" },

    pillRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    pill: (selected) => ({
      padding: '0.5rem 1rem',
      background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s',
      color: '#c8bfa8', fontFamily: "'Lora',Georgia,serif", fontSize: '0.8rem',
    }),

    pillarCard: (selected) => ({
      ...cardStyle(selected), display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', position: 'relative',
    }),
    rankBadge: { position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#c8a050,#9a7830)', color: '#0a0805', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, fontFamily: "'Cormorant Garamond',Georgia,serif" },

    saveRow: { display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.2rem' },
    saveMsg: { fontSize: '0.78rem', color: '#90b890', fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' },
    saveBtn: { padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#c8a050,#9a7830)', border: 'none', borderRadius: '999px', color: '#0a0805', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em' },
    cancelBtn: { padding: '0.65rem 1.3rem', background: 'transparent', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '999px', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', cursor: 'pointer' },

    // Account panel specific
    accountRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '0.6rem' },
    accountLabel: { fontSize: '0.75rem', color: '#9a7830', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Lora',Georgia,serif" },
    accountValue: { fontSize: '0.88rem', color: '#c8bfa8', fontFamily: "'Lora',Georgia,serif" },
    secondaryBtn: { padding: '0.5rem 1.1rem', background: 'transparent', border: '1px solid rgba(200,160,80,0.25)', borderRadius: '999px', color: '#c8a050', fontFamily: "'Lora',Georgia,serif", fontSize: '0.8rem', cursor: 'pointer' },
    dangerBtn: { padding: '0.5rem 1.1rem', background: 'transparent', border: '1px solid rgba(212,90,90,0.3)', borderRadius: '999px', color: '#d46060', fontFamily: "'Lora',Georgia,serif", fontSize: '0.8rem', cursor: 'pointer' },
    dangerConfirm: { background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', borderRadius: '10px', padding: '1rem 1.2rem', marginTop: '0.9rem' },
    dangerText: { fontSize: '0.82rem', color: '#d4a0a0', lineHeight: 1.6, marginBottom: '0.9rem', fontFamily: "'Lora',Georgia,serif" },
    dangerConfirmBtn: { padding: '0.55rem 1.2rem', background: '#8a3030', border: 'none', borderRadius: '999px', color: '#fff', fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', cursor: 'pointer', marginRight: '0.6rem' },

    onboardLink: { background: 'rgba(200,160,80,0.04)', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '10px', padding: '1rem 1.2rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' },
    onboardLinkText: { fontSize: '0.85rem', color: '#c8bfa8', fontFamily: "'Lora',Georgia,serif" },
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0805' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.5rem', fontWeight: 700, color: '#c8a050' }}>MM</div>
      </div>
    )
  }

  // ── Panel render helper ─────────────────────────
  const Panel = ({ id, icon, title, summary, fields, children }) => {
    const isOpen = openPanel === id
    return (
      <div style={s.panel(isOpen)}>
        <div style={s.panelHead} onClick={() => setOpenPanel(isOpen ? null : id)}>
          <div style={s.panelTitle}>
            <span style={s.panelIcon}>{icon}</span>{title}
          </div>
          <span style={s.panelEdit}>{isOpen ? 'Close ✕' : 'Edit ›'}</span>
        </div>
        {!isOpen && summary && <div style={s.panelSummary}>{summary}</div>}
        {isOpen && (
          <div style={s.panelBody} className="sage-fade-in">
            {children}
            {fields && (
              <div style={s.saveRow}>
                {panelMessage && savingPanel !== id && <span style={s.saveMsg}>{panelMessage}</span>}
                <button style={s.cancelBtn} onClick={() => setOpenPanel(null)}>Cancel</button>
                <button style={s.saveBtn} onClick={() => saveSection(id, fields)} disabled={savingPanel === id}>
                  {savingPanel === id ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Summary generators ──────────────────────────
  const identitySummary = [
    config.preferred_name && `${config.preferred_name}`,
    config.full_name && `(${config.full_name})`,
    config.date_of_birth && `born ${config.date_of_birth}`,
    config.birth_place && `in ${config.birth_place}`,
  ].filter(Boolean).join(' ') || 'Not set — tap Edit to add'

  const spiritualSummary = (() => {
    if (!config.spiritual_orientation) return 'Not set'
    const parts = [labelFor(SPIRITUAL_ORIENTATIONS, config.spiritual_orientation)]
    if (config.tradition_tier1 && config.tradition_tier1 !== 'private') {
      const t1 = labelFor(TRADITIONS_T1, config.tradition_tier1)
      parts.push(`· ${t1}${config.tradition_tier2 ? ` — ${config.tradition_tier2}` : ''}`)
    }
    if (config.esoteric_openness) parts.push(`· ${labelFor(ESOTERIC_OPENNESS, config.esoteric_openness)}`)
    return parts.join(' ')
  })()

  const beliefsSummary = [
    config.purpose_view && labelFor(PURPOSE_VIEWS, config.purpose_view),
    config.change_approach && labelFor(CHANGE_APPROACHES, config.change_approach),
    config.decision_trust && labelFor(DECISION_TRUSTS, config.decision_trust),
  ].filter(Boolean).join(' · ') || 'Not set'

  const architectureSummary = (config.pillars?.length > 0)
    ? config.pillars.map((id, i) => `${i + 1}. ${labelFor(PILLARS, id)}`).join('  ')
    : 'No pillars chosen yet'

  const shadowsSummary = [config.shadow_pattern, config.shadow_fear, config.shadow_admit].filter(Boolean).length
  const shadowsSummaryText = shadowsSummary > 0 ? `${shadowsSummary} of 3 shared` : 'Not shared'

  // ── Render ──────────────────────────────────────
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => navigate('/dashboard')}>
          <span style={s.navMM}>MM</span>Mystic Madman
        </div>
        <button style={s.navBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </nav>

      <div style={s.body}>
        <div style={s.header}>
          <h1 style={s.title}>Your Profile</h1>
          <p style={s.subtitle}>Revisit and update anything at any time</p>
        </div>

        {/* Account panel */}
        <Panel id="account" icon="🔑" title="Account" summary={session.user.email}>
          <div style={s.accountRow}>
            <div>
              <div style={s.accountLabel}>Email</div>
              <div style={s.accountValue}>{session.user.email}</div>
            </div>
          </div>
          <div style={s.accountRow}>
            <div>
              <div style={s.accountLabel}>Password</div>
              <div style={s.accountValue}>{passwordSent ? 'Reset email sent ✓' : '••••••••'}</div>
            </div>
            <button style={s.secondaryBtn} onClick={handleChangePassword} disabled={passwordSent}>
              {passwordSent ? 'Sent' : 'Change password'}
            </button>
          </div>
          <div style={s.accountRow}>
            <div>
              <div style={s.accountLabel}>Delete account</div>
              <div style={s.accountValue}>Permanently remove your data</div>
            </div>
            {!deleteConfirm && (
              <button style={s.dangerBtn} onClick={() => setDeleteConfirm(true)}>Delete account</button>
            )}
          </div>
          {deleteConfirm && (
            <div style={s.dangerConfirm}>
              <p style={s.dangerText}>
                This will permanently delete your profile, configuration, and all saved sessions. This action cannot be undone.
              </p>
              <button style={s.dangerConfirmBtn} onClick={handleDeleteAccount}>Yes, delete everything</button>
              <button style={s.cancelBtn} onClick={() => setDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </Panel>

        {/* Identity panel */}
        <Panel id="identity" icon="🌿" title="Identity"
          summary={identitySummary}
          fields={['full_name', 'date_of_birth', 'birth_place', 'preferred_name']}>
          <div style={s.field}>
            <label style={s.label}>Full birth name</label>
            <input style={s.input} value={config.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full birth name" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Date of birth</label>
            <input style={s.input} type="date" value={config.date_of_birth || ''} onChange={e => set('date_of_birth', e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Place of birth</label>
            <input style={s.input} value={config.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="City, Country" />
          </div>
          <div style={s.field}>
            <label style={s.label}>How you like to be addressed</label>
            <input style={s.input} value={config.preferred_name} onChange={e => set('preferred_name', e.target.value)} placeholder="What should Sage call you?" />
          </div>
        </Panel>

        {/* Spiritual Orientation panel */}
        <Panel id="spiritual" icon="✨" title="Spiritual Orientation"
          summary={spiritualSummary}
          fields={['spiritual_orientation', 'tradition_tier1', 'tradition_tier2', 'esoteric_openness']}>
          <div style={s.questionBlock}>
            <div style={s.questionTitle}>Spiritual orientation</div>
            <div style={s.cardsStack}>
              {SPIRITUAL_ORIENTATIONS.map(o => {
                const selected = config.spiritual_orientation === o.id
                return (
                  <div key={o.id} style={cardStyle(selected)} onClick={() => set('spiritual_orientation', selected ? '' : o.id)}>
                    <div style={s.cardTitle}>{o.title}</div>
                    {o.desc && <div style={s.cardDesc}>{o.desc}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {TRADITION_REVEAL.includes(config.spiritual_orientation) && (
            <div style={s.questionBlock}>
              <div style={s.questionTitle}>Tradition</div>
              <div style={s.cardsGrid}>
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
              {config.tradition_tier1 && TRADITIONS_T2[config.tradition_tier1] && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={s.label}>Specific tradition</label>
                  <select style={s.select} value={config.tradition_tier2} onChange={e => set('tradition_tier2', e.target.value)}>
                    <option value="">General / Not specified</option>
                    {TRADITIONS_T2[config.tradition_tier1].map((g, i) => g.group ? (
                      <optgroup key={i} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ) : (g.options.map(o => <option key={o} value={o}>{o}</option>))
                    )}
                    <option value="__private">Prefer not to say</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div style={s.questionBlock}>
            <div style={s.questionTitle}>Openness to esoteric frameworks</div>
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
        </Panel>

        {/* Beliefs panel */}
        <Panel id="beliefs" icon="🧠" title="Beliefs & Worldview"
          summary={beliefsSummary}
          fields={['purpose_view', 'change_approach', 'decision_trust']}>
          {[
            { title: "Life's purpose", key: 'purpose_view', options: PURPOSE_VIEWS },
            { title: 'Approach to change', key: 'change_approach', options: CHANGE_APPROACHES },
            { title: 'What you trust in decisions', key: 'decision_trust', options: DECISION_TRUSTS },
          ].map(q => (
            <div key={q.key} style={s.questionBlock}>
              <div style={s.questionTitle}>{q.title}</div>
              <div style={s.cardsStack}>
                {q.options.map(o => {
                  const selected = config[q.key] === o.id
                  return (
                    <div key={o.id} style={cardStyle(selected)} onClick={() => set(q.key, selected ? '' : o.id)}>
                      <div style={s.cardTitle}>{o.title}</div>
                      {o.desc && <div style={s.cardDesc}>{o.desc}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </Panel>

        {/* Life Architecture panel */}
        <Panel id="architecture" icon="🎯" title="Life Architecture"
          summary={architectureSummary}
          fields={['pillars', 'vision_5year', 'vision_change', 'vision_gift']}>
          <div style={s.questionBlock}>
            <div style={s.questionTitle}>Pillars (up to 5, in order of importance)</div>
            <div style={s.cardsGrid}>
              {PILLARS.map(p => {
                const rank = (config.pillars || []).indexOf(p.id)
                const selected = rank !== -1
                return (
                  <div key={p.id} style={s.pillarCard(selected)} onClick={() => {
                    setConfig(prev => {
                      const cur = prev.pillars || []
                      if (cur.includes(p.id)) return { ...prev, pillars: cur.filter(x => x !== p.id) }
                      if (cur.length >= 5) return prev
                      return { ...prev, pillars: [...cur, p.id] }
                    })
                  }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.9rem', fontWeight: 600, color: '#e8dfc8' }}>{p.title}</span>
                    {selected && <span style={s.rankBadge}>{rank + 1}</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Ideal life in 5 years</label>
            <textarea style={s.textarea} value={config.vision_5year} onChange={e => set('vision_5year', e.target.value)} placeholder="I am living in... I spend my days... The people around me..." rows={5} />
          </div>
          <div style={s.field}>
            <label style={s.label}>What you most want to change or create now</label>
            <textarea style={s.textarea} value={config.vision_change} onChange={e => set('vision_change', e.target.value)} placeholder="The thing I most want to shift is..." rows={3} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Your greatest gift to the world</label>
            <textarea style={s.textarea} value={config.vision_gift} onChange={e => set('vision_gift', e.target.value)} placeholder="What I have to offer that is uniquely mine is..." rows={3} />
          </div>
        </Panel>

        {/* Shadows panel */}
        <Panel id="shadows" icon="🌑" title="Shadows"
          summary={shadowsSummaryText}
          fields={['shadow_pattern', 'shadow_fear', 'shadow_admit']}>
          <div style={s.field}>
            <label style={s.label}>Repeating pattern you want to break</label>
            <textarea style={s.textarea} value={config.shadow_pattern} onChange={e => set('shadow_pattern', e.target.value)} placeholder="I keep finding myself..." rows={4} />
          </div>
          <div style={s.field}>
            <label style={s.label}>A fear that quietly limits you</label>
            <textarea style={s.textarea} value={config.shadow_fear} onChange={e => set('shadow_fear', e.target.value)} placeholder="Beneath the surface, what I'm most afraid of is..." rows={4} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Something hard to admit about yourself</label>
            <textarea style={s.textarea} value={config.shadow_admit} onChange={e => set('shadow_admit', e.target.value)} placeholder="If I'm really honest with myself..." rows={4} />
          </div>
        </Panel>

        {!config.onboarding_completed && (
          <div style={s.onboardLink}>
            <span style={s.onboardLinkText}>✨ Complete the full onboarding for deeper sessions</span>
            <button style={s.secondaryBtn} onClick={() => navigate('/onboarding')}>Begin →</button>
          </div>
        )}
      </div>
    </div>
  )
}
