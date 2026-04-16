import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import AppShell from '../components/AppShell'
import { CheckIcon } from '../components/Icons'
import {
  SPIRITUAL_ORIENTATIONS, TRADITIONS_T1, ESOTERIC_OPENNESS,
  PURPOSE_VIEWS, CHANGE_APPROACHES, DECISION_TRUSTS, PILLARS,
  GENDERS, labelFor,
} from './onboardingConfig'

const SYSTEM_PROMPT = `You are Sage — the perceptive AI mind behind Mystic Madman, a holistic life coach that integrates multiple domains of a person's life into unified, actionable guidance.

You will receive structured information including the person's profile, the specific life areas they have chosen to focus on for this session, and any interpretive lenses they have selected to deepen the reading.

CRITICAL INSTRUCTIONS:
1. Open your response by briefly acknowledging which life areas and lenses the person has selected for this session — this tells them you have heard what they want to focus on.
2. Structure your response ONLY around the areas and lenses they selected. Do NOT create sections for areas they did not choose.
3. For each selected life area, provide a focused, substantive section with a ## markdown heading that names patterns, surfaces themes, and offers honest insight specific to what they shared — never generic wellness advice.
4. For each selected lens, provide a dedicated section that interprets their situation through that lens.
5. Weave connections across selected areas and lenses where they are genuinely related.
6. Always end with:
   ## 🎯 Focus for Now — 3 to 5 concrete, prioritised actions
   ## 💬 A Word from Sage — a brief, personal closing message

Use markdown with ## for section headings and **bold** for emphasis. Speak with warmth, wisdom, and gentle directness.`

const LIFE_AREAS = [
  { id: 'love', icon: '❤️', short: 'Love', title: 'Love & Relationships', desc: 'Romantic life, intimacy, connection, loneliness, attachment patterns', color: '#d4a0a0',
    fields: [
      { id: 'situation', label: 'Current situation', placeholder: 'What does your romantic or relational life look like right now?' },
      { id: 'working', label: 'What is working', placeholder: 'What feels good or alive in your connections?' },
      { id: 'challenging', label: 'What is challenging', placeholder: 'Where do you feel hurt, disconnected, or stuck?' },
      { id: 'want', label: 'What you want', placeholder: 'What would feel like progress or healing in this area?' },
    ] },
  { id: 'work', icon: '💼', short: 'Work', title: 'Work & Purpose', desc: 'Career, ambition, creativity, calling, financial stress, direction', color: '#c8a050',
    fields: [
      { id: 'situation', label: 'Current situation', placeholder: 'What does your work life look like right now? What are you building?' },
      { id: 'energy', label: 'Energy around work', placeholder: 'Do you feel motivated, drained, confused, or on fire?' },
      { id: 'challenging', label: 'What is challenging', placeholder: 'Where do you feel blocked, frustrated, or unfulfilled?' },
      { id: 'want', label: 'What you want', placeholder: 'What would feel like meaningful progress in the next month?' },
    ] },
  { id: 'health', icon: '🫀', short: 'Health', title: 'Health & Body', desc: 'Energy levels, sleep, movement, diet, symptoms, physical patterns', color: '#a8c4a2',
    fields: [
      { id: 'energy', label: 'Energy levels', placeholder: 'How is your energy day to day? Morning vs evening? Crashes?' },
      { id: 'sleep', label: 'Sleep quality', placeholder: 'How many hours? Do you wake in the night? Feel rested?' },
      { id: 'movement', label: 'Movement and diet', placeholder: 'Exercise habits, diet patterns, anything you are avoiding or craving?' },
      { id: 'symptoms', label: 'Symptoms and concerns', placeholder: 'Any pain, tension, illness, or recurring physical patterns?' },
    ] },
  { id: 'mind', icon: '🧠', short: 'Mind', title: 'Mind & Emotions', desc: 'Mood, anxiety, recurring thoughts, self-perception, mental patterns', color: '#8b9fc2',
    fields: [
      { id: 'mood', label: 'Current emotional state', placeholder: 'How would you describe your emotional climate lately?' },
      { id: 'anxiety', label: 'Anxieties and fears', placeholder: 'What worries are occupying your mind right now?' },
      { id: 'thoughts', label: 'Recurring thoughts', placeholder: 'What thoughts or narratives keep returning?' },
      { id: 'selfimage', label: 'Self perception', placeholder: 'How do you see yourself right now? What do you like or struggle with?' },
    ] },
  { id: 'home', icon: '🏠', short: 'Home', title: 'Home & Family', desc: 'Domestic life, family dynamics, roots, belonging, living situation', color: '#c4a882',
    fields: [
      { id: 'living', label: 'Living situation', placeholder: 'How does your home environment feel? Peaceful, chaotic, temporary?' },
      { id: 'family', label: 'Family dynamics', placeholder: 'How are your key family relationships? Any tensions or joys?' },
      { id: 'belonging', label: 'Sense of belonging', placeholder: 'Do you feel rooted and at home, or displaced and searching?' },
      { id: 'attention', label: 'What needs attention', placeholder: 'What in your domestic or family life needs addressing?' },
    ] },
  { id: 'growth', icon: '🌱', short: 'Growth', title: 'Growth & Change', desc: 'Goals, transitions, what feels stuck, who you are becoming', color: '#9ec4a2',
    fields: [
      { id: 'pursuing', label: 'What you are pursuing', placeholder: 'What goals or visions are you actively working toward?' },
      { id: 'stuck', label: 'What feels stuck', placeholder: 'Where do you feel blocked or like you keep hitting the same wall?' },
      { id: 'transitions', label: 'Current transitions', placeholder: 'Any major changes, endings, or beginnings happening right now?' },
      { id: 'becoming', label: 'Who you are becoming', placeholder: 'How are you different from who you were a year ago?' },
    ] },
]

const LENSES = [
  { id: 'dreams', icon: '🌙', short: 'Dreams', title: 'Dreams', desc: 'Unconscious material, symbols, recurring dream themes', color: '#8b9fc2',
    fields: [
      { id: 'recent', label: 'Recent dreams', placeholder: 'Describe your most recent or memorable dreams in detail...' },
      { id: 'recurring', label: 'Recurring themes', placeholder: 'Any symbols, places, or people that appear repeatedly?' },
      { id: 'emotions', label: 'Dream emotions', placeholder: 'How do you feel during and after your dreams?' },
    ] },
  { id: 'astrology', icon: '✨', short: 'Astrology', title: 'Astrology', desc: 'Chart interpretation, current transits, cosmic weather', color: '#b8a0d4',
    fields: [
      { id: 'transits', label: 'Current transits or themes', placeholder: 'Any transits you are aware of, or cosmic themes that feel relevant?' },
      { id: 'placements', label: 'Additional placements', placeholder: 'Any placements beyond sun and moon you want interpreted?' },
    ] },
  { id: 'numerology', icon: '🔢', short: 'Numerology', title: 'Numerology', desc: 'Life path, personal year, name numbers', color: '#d4c07e',
    fields: [
      { id: 'patterns', label: 'Number patterns', placeholder: 'Do certain numbers keep appearing — on clocks, receipts, addresses?' },
      { id: 'known', label: 'Numbers you know', placeholder: 'If you know your Life Path or other numbers, share them here.' },
    ] },
  { id: 'intuitive', icon: '🔮', short: 'Intuitive', title: 'Intuitive', desc: 'Archetypal patterns, shadow work, spiritual themes', color: '#c8a0d0',
    fields: [
      { id: 'gut', label: 'What your gut is saying', placeholder: 'What does your intuition keep trying to tell you that your mind dismisses?' },
      { id: 'symbols', label: 'Recurring symbols or signs', placeholder: 'Any symbols, animals, or signs appearing in waking life?' },
      { id: 'shadow', label: 'Shadow or resistance', placeholder: 'What are you avoiding looking at? What feels too uncomfortable to face?' },
    ] },
]

const LOADING_MSGS = [
  'Sage is weaving the threads of your being...',
  'Consulting your stars...',
  'Reading between the lines...',
  'Listening to what you haven\'t said...',
  'Connecting the patterns...',
]

// ── Design tokens ─────────────────────────────────────
const C = {
  bg: '#141008', surface: '#1c1610', elevated: '#231e14',
  border: 'rgba(255,255,255,0.06)', borderMed: 'rgba(255,255,255,0.1)',
  borderGold: 'rgba(200,160,80,0.25)',
  gold: '#c8a050', goldMuted: '#9a7830', goldFaint: 'rgba(200,160,80,0.08)',
  text: '#f0e6c8', textSec: '#a09070', textMuted: '#5a5040', textDim: '#3a3020',
}

function MarkdownRenderer({ text }) {
  return (
    <div>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.2rem', color: C.gold, marginTop: '2rem', marginBottom: '0.6rem', borderBottom: `1px solid rgba(200,160,80,0.12)`, paddingBottom: '0.4rem', fontWeight: 600 }}>{line.replace('## ', '')}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', color: C.text, marginTop: '1rem', marginBottom: '0.3rem', fontWeight: 600 }}>{line.replace('### ', '')}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', paddingLeft: '0.3rem' }}><span style={{ color: C.gold, flexShrink: 0, marginTop: '4px', fontSize: '0.55rem' }}>◆</span><span style={{ color: C.text, lineHeight: 1.9, fontFamily: "'Lora',Georgia,serif", fontSize: '0.95rem' }}>{line.replace(/^[-•] /, '')}</span></div>
        if (line.match(/^\d+\. /)) { const num = line.match(/^(\d+)\./)[1]; return <div key={i} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.45rem', paddingLeft: '0.3rem' }}><span style={{ color: C.gold, fontWeight: 700, flexShrink: 0, minWidth: '1.2rem', fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{num}.</span><span style={{ color: C.text, lineHeight: 1.9, fontFamily: "'Lora',Georgia,serif", fontSize: '0.95rem' }}>{line.replace(/^\d+\. /, '')}</span></div> }
        if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return <p key={i} style={{ color: C.textSec, lineHeight: 1.9, marginBottom: '0.3rem', fontFamily: "'Lora',Georgia,serif", fontSize: '0.95rem' }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, color: C.text }}>{p}</strong> : p)}</p>
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────
export default function Session({ session }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [stage, setStage] = useState('focus') // 'focus' | 'input' | 'loading' | 'reading'
  const [selectedAreas, setSelectedAreas] = useState([])
  const [selectedLenses, setSelectedLenses] = useState([])
  const [currentInputIdx, setCurrentInputIdx] = useState(0)
  const [inputs, setInputs] = useState(() => {
    const o = {}
    ;[...LIFE_AREAS, ...LENSES].forEach(item => { o[item.id] = {}; item.fields.forEach(f => { o[item.id][f.id] = '' }) })
    return o
  })
  const [reading, setReading] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followUps, setFollowUps] = useState([])
  const [question, setQuestion] = useState('')
  const [askingFollowUp, setAskingFollowUp] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const readingRef = useRef(null)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
    ]).then(([{ data: prof }, { data: cfg }, { count }]) => {
      setProfile(prof); setUserConfig(cfg); setSessionCount(count || 0)
    })
  }, [session])

  useEffect(() => {
    if (stage !== 'loading') return
    const timer = setInterval(() => setLoadingMsg(p => (p + 1) % LOADING_MSGS.length), 4000)
    return () => clearInterval(timer)
  }, [stage])

  const allTabs = [...LIFE_AREAS.filter(a => selectedAreas.includes(a.id)), ...LENSES.filter(l => selectedLenses.includes(l.id))]
  const currentTab = allTabs[currentInputIdx]
  const toggleArea = (id) => setSelectedAreas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleLens = (id) => setSelectedLenses(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const setField = (tabId, fieldId, val) => setInputs(p => ({ ...p, [tabId]: { ...p[tabId], [fieldId]: val } }))

  const transition = (next) => {
    setFadeIn(false)
    setTimeout(() => { setStage(next); setFadeIn(true); window.scrollTo({ top: 0, behavior: 'instant' }) }, 250)
  }

  const handleBeginSession = () => {
    setCurrentInputIdx(0)
    transition('input')
  }

  // ── Build context (unchanged business logic) ────────
  const buildContext = () => {
    let ctx = ''
    const idParts = []
    const fullName = userConfig?.full_name || profile?.full_name
    const dob = userConfig?.date_of_birth || profile?.date_of_birth
    const birthPlace = userConfig?.birth_place || profile?.birth_place
    if (userConfig?.preferred_name) idParts.push(`Preferred name: ${userConfig.preferred_name}`)
    if (fullName) idParts.push(`Full birth name: ${fullName}`)
    if (userConfig?.current_name) idParts.push(`Current name: ${userConfig.current_name}`)
    if (dob) idParts.push(`Date of birth: ${dob}`)
    if (userConfig?.time_of_birth) idParts.push(`Time of birth: ${userConfig.time_of_birth}`)
    if (birthPlace) idParts.push(`Birth place: ${birthPlace}`)
    if (userConfig?.gender) idParts.push(`Gender: ${labelFor(GENDERS, userConfig.gender)}`)
    if (profile?.sun_sign) idParts.push(`Sun: ${profile.sun_sign}`)
    if (profile?.moon_sign) idParts.push(`Moon: ${profile.moon_sign}`)
    if (profile?.rising_sign) idParts.push(`Rising: ${profile.rising_sign}`)
    if (idParts.length) ctx += `### Identity\n${idParts.join('\n')}\n\n`

    if (userConfig) {
      const fp = []
      if (userConfig.spiritual_orientation) { let l = `Spiritual orientation: ${labelFor(SPIRITUAL_ORIENTATIONS, userConfig.spiritual_orientation)}`; if (userConfig.tradition_tier1 && userConfig.tradition_tier1 !== 'private') { l += ` · ${labelFor(TRADITIONS_T1, userConfig.tradition_tier1)}`; if (userConfig.tradition_tier2 && userConfig.tradition_tier2 !== '__private') l += ` — ${userConfig.tradition_tier2}` }; fp.push(l) }
      if (userConfig.esoteric_openness) fp.push(`Esoteric openness: ${labelFor(ESOTERIC_OPENNESS, userConfig.esoteric_openness)}`)
      const wb = []; if (userConfig.purpose_view) wb.push(labelFor(PURPOSE_VIEWS, userConfig.purpose_view)); if (userConfig.change_approach) wb.push(labelFor(CHANGE_APPROACHES, userConfig.change_approach)); if (userConfig.decision_trust) wb.push(labelFor(DECISION_TRUSTS, userConfig.decision_trust)); if (wb.length) fp.push(`Worldview: ${wb.join('; ')}`)
      if (userConfig.pillars?.length) fp.push(`Pillars: ${userConfig.pillars.map((id, i) => `${i+1}. ${labelFor(PILLARS, id)}`).join(', ')}`)
      if (userConfig.vision_5year) fp.push(`5-year vision: ${userConfig.vision_5year}`)
      if (userConfig.vision_change) fp.push(`Wants to change: ${userConfig.vision_change}`)
      if (userConfig.vision_gift) fp.push(`Gift: ${userConfig.vision_gift}`)
      if (fp.length) ctx += `### Foundation — never quote back\n${fp.join('\n')}\n\n`
      const sh = []; if (userConfig.shadow_pattern) sh.push(`Pattern: ${userConfig.shadow_pattern}`); if (userConfig.shadow_fear) sh.push(`Fear: ${userConfig.shadow_fear}`); if (userConfig.shadow_admit) sh.push(`Admit: ${userConfig.shadow_admit}`)
      if (sh.length) ctx += `### Shadow — handle with care, never quote\n${sh.join('\n')}\n\n`
    }

    const areaNames = LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).map(a => a.title)
    const lensNames = LENSES.filter(l => selectedLenses.includes(l.id)).map(l => l.title)
    ctx += `### Session Focus\nAreas: ${areaNames.join(', ') || '(none)'}\nLenses: ${lensNames.join(', ') || '(none)'}\n\n`

    LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).forEach(area => {
      const ai = inputs[area.id] || {}
      const lines = area.fields.filter(f => ai[f.id]?.trim()).map(f => `**${f.label}:** ${ai[f.id].trim()}`).join('\n')
      ctx += `### ${area.title}\n${lines || '*Selected — no details*'}\n\n`
    })
    LENSES.filter(l => selectedLenses.includes(l.id)).forEach(lens => {
      const li = inputs[lens.id] || {}; let lc = ''
      if (lens.id === 'astrology') { const p = []; if (profile?.sun_sign) p.push(`Sun ${profile.sun_sign}`); if (profile?.moon_sign) p.push(`Moon ${profile.moon_sign}`); if (profile?.rising_sign) p.push(`Rising ${profile.rising_sign}`); const d = userConfig?.date_of_birth || profile?.date_of_birth; if (d) p.push(`DOB ${d}`); if (userConfig?.time_of_birth) p.push(`Time ${userConfig.time_of_birth}`); const bp = userConfig?.birth_place || profile?.birth_place; if (bp) p.push(`Born ${bp}`); if (p.length) lc += `*Chart: ${p.join(', ')}*\n` }
      if (lens.id === 'numerology') { const p = []; const bn = userConfig?.full_name || profile?.full_name; if (bn) p.push(`Birth name: ${bn}`); if (userConfig?.current_name) p.push(`Current: ${userConfig.current_name}`); const d = userConfig?.date_of_birth || profile?.date_of_birth; if (d) p.push(`DOB: ${d}`); if (p.length) lc += `*Profile: ${p.join(', ')}*\n` }
      const lines = lens.fields.filter(f => li[f.id]?.trim()).map(f => `**${f.label}:** ${li[f.id].trim()}`).join('\n')
      if (lines) lc += lines
      ctx += `### ${lens.title} (Lens)\n${lc || '*Selected — no extra details*'}\n\n`
    })
    return ctx.trim()
  }

  const handleSubmit = async () => {
    if (selectedAreas.length === 0) return
    transition('loading')
    setReading('')
    const ctx = buildContext()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2500, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: ctx }] }),
      })
      const data = await res.json()
      setReading(data.content?.map(b => b.text || '').join('') || 'No response received.')
    } catch { setReading('There was an error connecting to Sage. Please try again.') }
    transition('reading')
  }

  const handleSave = async () => {
    if (!reading || saved) return
    setSaving(true)
    const title = `Session — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    await supabase.from('sessions').insert({ user_id: session.user.id, title, inputs, reading })
    setSaving(false); setSaved(true)
  }

  const handleFollowUp = async () => {
    if (!question.trim()) return
    const q = question.trim(); setQuestion(''); setAskingFollowUp(true)
    const ctx = buildContext()
    const messages = [{ role: 'user', content: ctx }, { role: 'assistant', content: reading }, ...followUps.flatMap(f => [{ role: 'user', content: f.q }, { role: 'assistant', content: f.a }]), { role: 'user', content: q }]
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1200, system: SYSTEM_PROMPT, messages }),
      })
      const data = await res.json()
      setFollowUps(p => [...p, { q, a: data.content?.map(b => b.text || '').join('') || 'No response.' }])
    } catch { setFollowUps(p => [...p, { q, a: 'There was an error. Please try again.' }]) }
    setAskingFollowUp(false)
  }

  // ── Styles ──────────────────────────────────────────
  const fadeStyle = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }

  const areaCard = (selected) => ({
    background: selected ? C.goldFaint : C.surface,
    border: `1.5px solid ${selected ? C.gold : C.border}`,
    borderRadius: 12, padding: '1.2rem', cursor: 'pointer',
    transition: 'all 0.2s', minHeight: 160,
    display: 'flex', flexDirection: 'column', position: 'relative',
    boxShadow: selected ? `inset 0 0 0 1px ${C.borderGold}` : 'none',
  })
  const lensCard = (selected) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.55rem 1.1rem', borderRadius: 999,
    background: selected ? C.goldFaint : C.surface,
    border: `1.5px solid ${selected ? C.gold : C.border}`,
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', color: C.text,
  })
  const goldBtn = (active) => ({
    padding: '0.85rem 2.2rem',
    background: active ? `linear-gradient(135deg,${C.gold},${C.goldMuted})` : C.surface,
    border: 'none', borderRadius: 999,
    color: active ? '#0f0c08' : C.textDim,
    fontFamily: "'Cormorant Garamond',Georgia,serif",
    fontSize: '1rem', fontWeight: 700, cursor: active ? 'pointer' : 'default',
    opacity: active ? 1 : 0.4, transition: 'all 0.3s', letterSpacing: '0.03em',
  })
  const textareaStyle = {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '0.75rem 0.95rem', color: C.text,
    fontSize: '0.92rem', lineHeight: 1.8, resize: 'vertical',
    fontFamily: "'Lora',Georgia,serif", outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <AppShell session={session} pageName="New Session">
      {/* ── STAGE: FOCUS ───────────────────────────── */}
      {stage === 'focus' && (
        <div style={fadeStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: C.text, marginBottom: '0.5rem' }}>What would you like to explore?</h1>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.9rem', color: C.textSec, fontStyle: 'italic' }}>Select the areas calling for attention today</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {LIFE_AREAS.map(a => {
              const sel = selectedAreas.includes(a.id)
              return (
                <div key={a.id} style={areaCard(sel)} onClick={() => toggleArea(a.id)}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.borderMed }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border }}>
                  {sel && <span style={{ position: 'absolute', top: 10, right: 10 }}><CheckIcon size={16} color={C.gold} /></span>}
                  <div style={{ fontSize: '2rem', marginBottom: '0.6rem', lineHeight: 1 }}>{a.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.05rem', fontWeight: 600, color: C.text, marginBottom: '0.3rem' }}>{a.title}</div>
                  <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textMuted, lineHeight: 1.55, marginTop: 'auto' }}>{a.desc}</div>
                </div>
              )
            })}
          </div>

          {/* Lenses */}
          <div style={{ borderTop: `1px solid ${C.borderGold}`, paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.goldMuted, marginBottom: '0.9rem' }}>Deepen your reading with a lens</div>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {LENSES.map(l => {
                const sel = selectedLenses.includes(l.id)
                return <button key={l.id} style={lensCard(sel)} onClick={() => toggleLens(l.id)}><span style={{ fontSize: '0.95rem' }}>{l.icon}</span>{l.short}</button>
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button style={goldBtn(selectedAreas.length > 0)} onClick={selectedAreas.length > 0 ? handleBeginSession : undefined} disabled={selectedAreas.length === 0}>Begin Session →</button>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem', color: C.textDim, marginTop: '0.7rem' }}>Session {sessionCount + 1} of your journey</p>
          </div>
        </div>
      )}

      {/* ── STAGE: INPUT ───────────────────────────── */}
      {stage === 'input' && currentTab && (
        <div style={fadeStyle}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem', justifyContent: 'center' }}>
            {allTabs.map((t, i) => (
              <div key={t.id} onClick={() => setCurrentInputIdx(i)} style={{
                padding: '0.35rem 0.8rem', borderRadius: 999, cursor: 'pointer',
                background: i === currentInputIdx ? C.goldFaint : 'transparent',
                border: `1px solid ${i === currentInputIdx ? C.borderGold : 'transparent'}`,
                fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem',
                color: i === currentInputIdx ? C.gold : C.textMuted,
                transition: 'all 0.2s',
              }}>{t.icon} {t.short}</div>
            ))}
          </div>

          {/* Area header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.5rem', padding: '1rem 1.2rem', background: `${currentTab.color}10`, borderRadius: 12, border: `1px solid ${currentTab.color}25` }}>
            <span style={{ fontSize: '1.8rem' }}>{currentTab.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.2rem', fontWeight: 600, color: C.text }}>{currentTab.title}</div>
              <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textSec }}>{currentTab.desc}</div>
            </div>
          </div>

          {/* Fields */}
          {currentTab.fields.map(f => (
            <div key={f.id} style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontFamily: "'Lora',Georgia,serif", fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: currentTab.color, marginBottom: '0.45rem' }}>{f.label}</label>
              <textarea
                style={textareaStyle}
                value={inputs[currentTab.id]?.[f.id] || ''}
                onChange={e => setField(currentTab.id, f.id, e.target.value)}
                placeholder={f.placeholder} rows={3}
                onFocus={e => e.target.style.borderColor = C.borderGold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem' }}>
            <button onClick={() => { if (currentInputIdx > 0) setCurrentInputIdx(currentInputIdx - 1); else transition('focus') }}
              style={{ padding: '0.7rem 1.4rem', background: 'none', border: `1px solid ${C.borderGold}`, borderRadius: 999, color: C.textSec, fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', cursor: 'pointer' }}>
              ← {currentInputIdx > 0 ? 'Back' : 'Areas'}
            </button>
            {currentInputIdx < allTabs.length - 1 ? (
              <button onClick={() => setCurrentInputIdx(currentInputIdx + 1)}
                style={{ ...goldBtn(true), padding: '0.7rem 1.6rem' }}>
                Next: {allTabs[currentInputIdx + 1]?.icon} {allTabs[currentInputIdx + 1]?.short} →
              </button>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', fontStyle: 'italic', color: C.textMuted, marginBottom: '0.5rem' }}>Sage is ready to read your session</p>
                <button style={{ ...goldBtn(true), padding: '0.85rem 2rem' }} onClick={handleSubmit}>Seek Guidance →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STAGE: LOADING ─────────────────────────── */}
      {stage === 'loading' && (
        <div style={{ ...fadeStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: C.goldFaint, border: `1.5px solid ${C.borderGold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'breathe 3s ease-in-out infinite',
          }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.6rem', fontWeight: 700, color: C.gold }}>MM</span>
          </div>
          <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.92rem', fontStyle: 'italic', color: C.textSec, marginTop: '1.5rem', transition: 'opacity 0.5s', minHeight: '1.5rem' }}>
            {LOADING_MSGS[loadingMsg]}
          </p>
          <style>{`@keyframes breathe{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.05);opacity:1}}`}</style>
        </div>
      )}

      {/* ── STAGE: READING ─────────────────────────── */}
      {stage === 'reading' && (
        <div style={fadeStyle}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.goldFaint, border: `1px solid ${C.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.72rem', fontWeight: 700, color: C.gold }}>MM</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.15rem', fontWeight: 600, color: C.text }}>Your Session Reading</div>
                <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem', color: C.textMuted }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || saved}
              style={{
                padding: '0.4rem 1.2rem', borderRadius: 999,
                background: saved ? 'rgba(140,180,140,0.1)' : `linear-gradient(135deg,${C.gold},${C.goldMuted})`,
                border: saved ? '1px solid rgba(140,180,140,0.25)' : 'none',
                color: saved ? '#90b890' : '#0f0c08',
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.82rem', fontWeight: 700, cursor: saved ? 'default' : 'pointer',
              }}>
              {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Session'}
            </button>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 'clamp(1.2rem,3vw,2rem)' }}>
            <MarkdownRenderer text={reading} />
          </div>

          {/* Follow-up */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg,transparent,${C.borderGold},transparent)`, marginBottom: '1.5rem' }} />
            <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.goldMuted, marginBottom: '1rem' }}>Continue the conversation</div>

            {followUps.map((f, i) => (
              <div key={i} style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <div style={{ background: C.elevated, borderRadius: 12, padding: '0.6rem 1rem', maxWidth: '80%', fontFamily: "'Lora',Georgia,serif", fontSize: '0.88rem', color: C.textSec, fontStyle: 'italic' }}>{f.q}</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1rem 1.2rem' }}><MarkdownRenderer text={f.a} /></div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.5rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: '0.35rem 0.4rem 0.35rem 1rem' }}>
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                placeholder="Ask Sage anything about your reading..."
                style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: '0.88rem', outline: 'none', fontFamily: "'Lora',Georgia,serif" }}
              />
              <button onClick={handleFollowUp} disabled={!question.trim() || askingFollowUp}
                style={{ padding: '0.5rem 1.2rem', background: C.gold, border: 'none', borderRadius: 999, color: '#0f0c08', fontSize: '0.82rem', fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, cursor: 'pointer', opacity: question.trim() ? 1 : 0.4 }}>
                {askingFollowUp ? '...' : 'Ask Sage →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
