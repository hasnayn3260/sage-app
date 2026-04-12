import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  SPIRITUAL_ORIENTATIONS, TRADITIONS_T1, ESOTERIC_OPENNESS,
  PURPOSE_VIEWS, CHANGE_APPROACHES, DECISION_TRUSTS, PILLARS, labelFor,
} from './onboardingConfig'

// ── System Prompt ──────────────────────────────────────
const SYSTEM_PROMPT = `You are Sage — the perceptive AI mind behind Mystic Madman, a holistic life coach that integrates multiple domains of a person's life into unified, actionable guidance.

You will receive structured information including the person's profile, the specific life areas they have chosen to focus on for this session, and any interpretive lenses they have selected to deepen the reading.

CRITICAL INSTRUCTIONS:
1. Open your response by briefly acknowledging which life areas and lenses the person has selected for this session — this tells them you have heard what they want to focus on.
2. Structure your response ONLY around the areas and lenses they selected. Do NOT create sections for areas they did not choose. If they selected only Love and Work, you give only those two focused sections (plus the overall synthesis and action steps). If they selected all six areas and all four lenses, you give the full reading.
3. For each selected life area, provide a focused, substantive section with a ## markdown heading that names patterns, surfaces themes, and offers honest insight specific to what they shared — never generic wellness advice.
4. For each selected lens, provide a dedicated section that interprets their situation through that lens:
   - Dreams: interpret symbols and emotions in the context of their waking situation
   - Astrology: use the chart data from their profile plus any transits they mentioned, and connect current cosmic weather to what they are experiencing
   - Numerology: calculate their Life Path from their date of birth, interpret their personal year, and connect numerical cycles to this phase of life
   - Intuitive: surface archetypal patterns, shadow themes, and what their gut is already telling them
5. Weave connections across selected areas and lenses where they are genuinely related — do not force connections that are not there.
6. Always end with two closing sections:
   ## 🎯 Focus for Now — 3 to 5 concrete, prioritised actions specific to what they shared
   ## 💬 A Word from Sage — a brief, personal closing message that is honest, compassionate, and specific to them

Use markdown with ## for section headings and **bold** for emphasis. Speak with warmth, wisdom, and gentle directness. Treat the person as intelligent and capable. Avoid vague spiritual platitudes.`

// ── Life Areas ──────────────────────────────────────────
const LIFE_AREAS = [
  {
    id: 'love', icon: '❤️', short: 'Love',
    title: 'Love & Relationships',
    desc: 'Romantic life, intimacy, connection, loneliness, attachment patterns',
    color: '#d4a0a0',
    fields: [
      { id: 'situation', label: 'Current situation', placeholder: 'What does your romantic or relational life look like right now?' },
      { id: 'working', label: 'What is working', placeholder: 'What feels good or alive in your connections?' },
      { id: 'challenging', label: 'What is challenging', placeholder: 'Where do you feel hurt, disconnected, or stuck?' },
      { id: 'want', label: 'What you want', placeholder: 'What would feel like progress or healing in this area?' },
    ],
  },
  {
    id: 'work', icon: '💼', short: 'Work',
    title: 'Work & Purpose',
    desc: 'Career, ambition, creativity, calling, financial stress, direction',
    color: '#c8a050',
    fields: [
      { id: 'situation', label: 'Current situation', placeholder: 'What does your work life look like right now? What are you building?' },
      { id: 'energy', label: 'Energy around work', placeholder: 'Do you feel motivated, drained, confused, or on fire?' },
      { id: 'challenging', label: 'What is challenging', placeholder: 'Where do you feel blocked, frustrated, or unfulfilled?' },
      { id: 'want', label: 'What you want', placeholder: 'What would feel like meaningful progress in the next month?' },
    ],
  },
  {
    id: 'health', icon: '🫀', short: 'Health',
    title: 'Health & Body',
    desc: 'Energy levels, sleep, movement, diet, symptoms, physical patterns',
    color: '#a8c4a2',
    fields: [
      { id: 'energy', label: 'Energy levels', placeholder: 'How is your energy day to day? Morning vs evening? Crashes?' },
      { id: 'sleep', label: 'Sleep quality', placeholder: 'How many hours? Do you wake in the night? Feel rested?' },
      { id: 'movement', label: 'Movement and diet', placeholder: 'Exercise habits, diet patterns, anything you are avoiding or craving?' },
      { id: 'symptoms', label: 'Symptoms and concerns', placeholder: 'Any pain, tension, illness, or recurring physical patterns?' },
    ],
  },
  {
    id: 'mind', icon: '🧠', short: 'Mind',
    title: 'Mind & Emotions',
    desc: 'Mood, anxiety, recurring thoughts, self-perception, mental patterns',
    color: '#8b9fc2',
    fields: [
      { id: 'mood', label: 'Current emotional state', placeholder: 'How would you describe your emotional climate lately?' },
      { id: 'anxiety', label: 'Anxieties and fears', placeholder: 'What worries are occupying your mind right now?' },
      { id: 'thoughts', label: 'Recurring thoughts', placeholder: 'What thoughts or narratives keep returning?' },
      { id: 'selfimage', label: 'Self perception', placeholder: 'How do you see yourself right now? What do you like or struggle with?' },
    ],
  },
  {
    id: 'home', icon: '🏠', short: 'Home',
    title: 'Home & Family',
    desc: 'Domestic life, family dynamics, roots, belonging, living situation',
    color: '#c4a882',
    fields: [
      { id: 'living', label: 'Living situation', placeholder: 'How does your home environment feel? Peaceful, chaotic, temporary?' },
      { id: 'family', label: 'Family dynamics', placeholder: 'How are your key family relationships? Any tensions or joys?' },
      { id: 'belonging', label: 'Sense of belonging', placeholder: 'Do you feel rooted and at home, or displaced and searching?' },
      { id: 'attention', label: 'What needs attention', placeholder: 'What in your domestic or family life needs addressing?' },
    ],
  },
  {
    id: 'growth', icon: '🌱', short: 'Growth',
    title: 'Growth & Change',
    desc: 'Goals, transitions, what feels stuck, who you are becoming',
    color: '#9ec4a2',
    fields: [
      { id: 'pursuing', label: 'What you are pursuing', placeholder: 'What goals or visions are you actively working toward?' },
      { id: 'stuck', label: 'What feels stuck', placeholder: 'Where do you feel blocked or like you keep hitting the same wall?' },
      { id: 'transitions', label: 'Current transitions', placeholder: 'Any major changes, endings, or beginnings happening right now?' },
      { id: 'becoming', label: 'Who you are becoming', placeholder: 'How are you different from who you were a year ago?' },
    ],
  },
]

// ── Lenses ──────────────────────────────────────────────
const LENSES = [
  {
    id: 'dreams', icon: '🌙', short: 'Dreams',
    title: 'Dreams', desc: 'Unconscious material, symbols, recurring dream themes',
    color: '#8b9fc2',
    fields: [
      { id: 'recent', label: 'Recent dreams', placeholder: 'Describe your most recent or memorable dreams in as much detail as you recall...' },
      { id: 'recurring', label: 'Recurring themes', placeholder: 'Any symbols, places, or people that appear repeatedly?' },
      { id: 'emotions', label: 'Dream emotions', placeholder: 'How do you feel during and after your dreams?' },
    ],
  },
  {
    id: 'astrology', icon: '✨', short: 'Astrology',
    title: 'Astrology', desc: 'Chart interpretation, current transits, cosmic weather',
    color: '#b8a0d4',
    fields: [
      { id: 'transits', label: 'Current transits or themes', placeholder: 'Any transits you are aware of, or cosmic themes that feel relevant?' },
      { id: 'placements', label: 'Additional placements', placeholder: 'Any placements beyond sun and moon you want interpreted?' },
    ],
  },
  {
    id: 'numerology', icon: '🔢', short: 'Numerology',
    title: 'Numerology', desc: 'Life path, personal year, name numbers',
    color: '#d4c07e',
    fields: [
      { id: 'patterns', label: 'Number patterns', placeholder: 'Do certain numbers keep appearing — on clocks, receipts, addresses?' },
      { id: 'known', label: 'Numbers you know', placeholder: 'If you know your Life Path or other numbers, share them here.' },
    ],
  },
  {
    id: 'intuitive', icon: '🔮', short: 'Intuitive',
    title: 'Intuitive', desc: 'Archetypal patterns, shadow work, spiritual themes',
    color: '#c8a0d0',
    fields: [
      { id: 'gut', label: 'What your gut is saying', placeholder: 'What does your intuition keep trying to tell you that your mind dismisses?' },
      { id: 'symbols', label: 'Recurring symbols or signs', placeholder: 'Any symbols, animals, or signs appearing in waking life?' },
      { id: 'shadow', label: 'Shadow or resistance', placeholder: 'What are you avoiding looking at? What feels too uncomfortable to face?' },
    ],
  },
]

// ── Markdown Renderer ────────────────────────────────────
function MarkdownRenderer({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.15rem', color: '#c8a050', marginTop: '1.8rem', marginBottom: '0.6rem', borderBottom: '1px solid rgba(200,160,80,0.12)', paddingBottom: '0.4rem', fontWeight: 600 }}>{line.replace('## ', '')}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.95rem', color: '#e8dfc8', marginTop: '0.9rem', marginBottom: '0.3rem', fontWeight: 600 }}>{line.replace('### ', '')}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.35rem', paddingLeft: '0.3rem' }}><span style={{ color: '#c8a050', flexShrink: 0, marginTop: '3px' }}>◆</span><span style={{ color: '#c8bfa8', lineHeight: 1.75, fontFamily: "'Lora',Georgia,serif" }}>{line.replace(/^[-•] /, '')}</span></div>
        if (line.match(/^\d+\. /)) { const num = line.match(/^(\d+)\./)[1]; return <div key={i} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.4rem', paddingLeft: '0.3rem' }}><span style={{ color: '#c8a050', fontWeight: 700, flexShrink: 0, minWidth: '1.2rem', fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{num}.</span><span style={{ color: '#c8bfa8', lineHeight: 1.75, fontFamily: "'Lora',Georgia,serif" }}>{line.replace(/^\d+\. /, '')}</span></div> }
        if (line.trim() === '') return <div key={i} style={{ height: '0.35rem' }} />
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return <p key={i} style={{ color: '#9a8e78', lineHeight: 1.8, marginBottom: '0.25rem', fontFamily: "'Lora',Georgia,serif" }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#d4c4a4', fontWeight: 500 }}>{p}</strong> : p)}</p>
      })}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────
export default function Session({ session }) {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [profile, setProfile] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [step, setStep] = useState('select') // 'select' | 'form'
  const [selectedAreas, setSelectedAreas] = useState([])
  const [selectedLenses, setSelectedLenses] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [inputs, setInputs] = useState(() => {
    const o = {}
    ;[...LIFE_AREAS, ...LENSES].forEach(item => {
      o[item.id] = {}
      item.fields.forEach(f => { o[item.id][f.id] = '' })
    })
    return o
  })
  const [reading, setReading] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followUps, setFollowUps] = useState([])
  const [question, setQuestion] = useState('')
  const [askingFollowUp, setAskingFollowUp] = useState(false)
  const readingRef = useRef(null)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('user_configuration').select('*').eq('user_id', session.user.id).maybeSingle(),
    ]).then(([{ data: prof }, { data: cfg }]) => {
      setProfile(prof)
      setUserConfig(cfg)
    })
  }, [session])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // ── Computed ────────────────────────────────────────
  const allTabs = [
    ...LIFE_AREAS.filter(a => selectedAreas.includes(a.id)),
    ...LENSES.filter(l => selectedLenses.includes(l.id)),
  ]
  const tabFilled = (tab) => tab.fields.some(f => inputs[tab.id]?.[f.id]?.trim())
  const currentStep = step === 'select' ? 1 : reading ? 3 : 2

  // ── Handlers ────────────────────────────────────────
  const toggleArea = (id) => setSelectedAreas(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
  const toggleLens = (id) => setSelectedLenses(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
  const setField = (tabId, fieldId, val) =>
    setInputs(prev => ({ ...prev, [tabId]: { ...prev[tabId], [fieldId]: val } }))

  const handleBeginSession = () => {
    setActiveTab(allTabs[0]?.id || null)
    setStep('form')
  }

  const buildContext = () => {
    let ctx = ''

    // ── Identity ────────────────────────────────────
    const idParts = []
    const fullName = userConfig?.full_name || profile?.full_name
    const dob = userConfig?.date_of_birth || profile?.date_of_birth
    const birthPlace = userConfig?.birth_place || profile?.birth_place
    if (userConfig?.preferred_name) idParts.push(`Preferred name: ${userConfig.preferred_name}`)
    if (fullName) idParts.push(`Full name: ${fullName}`)
    if (dob) idParts.push(`Date of birth: ${dob}`)
    if (birthPlace) idParts.push(`Birth place: ${birthPlace}`)
    if (profile?.sun_sign) idParts.push(`Sun: ${profile.sun_sign}`)
    if (profile?.moon_sign) idParts.push(`Moon: ${profile.moon_sign}`)
    if (profile?.rising_sign) idParts.push(`Rising: ${profile.rising_sign}`)
    if (idParts.length) ctx += `### Identity\n${idParts.join('\n')}\n\n`

    // ── User Foundation (from onboarding) ───────────
    if (userConfig) {
      const foundationParts = []

      // Spiritual orientation
      if (userConfig.spiritual_orientation) {
        const orient = labelFor(SPIRITUAL_ORIENTATIONS, userConfig.spiritual_orientation)
        let line = `Spiritual orientation: ${orient}`
        if (userConfig.tradition_tier1 && userConfig.tradition_tier1 !== 'private') {
          line += ` · Tradition: ${labelFor(TRADITIONS_T1, userConfig.tradition_tier1)}`
          if (userConfig.tradition_tier2 && userConfig.tradition_tier2 !== '__private') {
            line += ` — ${userConfig.tradition_tier2}`
          }
        }
        foundationParts.push(line)
      }
      if (userConfig.esoteric_openness) {
        foundationParts.push(`Openness to esoteric frameworks: ${labelFor(ESOTERIC_OPENNESS, userConfig.esoteric_openness)}`)
      }

      // Worldview
      const worldviewBits = []
      if (userConfig.purpose_view) worldviewBits.push(`Purpose view — ${labelFor(PURPOSE_VIEWS, userConfig.purpose_view)}`)
      if (userConfig.change_approach) worldviewBits.push(`Approach to change — ${labelFor(CHANGE_APPROACHES, userConfig.change_approach)}`)
      if (userConfig.decision_trust) worldviewBits.push(`Trusts in decisions — ${labelFor(DECISION_TRUSTS, userConfig.decision_trust)}`)
      if (worldviewBits.length) foundationParts.push(`Worldview: ${worldviewBits.join('; ')}`)

      // Pillars
      if (userConfig.pillars?.length > 0) {
        const pillarList = userConfig.pillars.map((id, i) => `${i + 1}. ${labelFor(PILLARS, id)}`).join(', ')
        foundationParts.push(`Life pillars (in order): ${pillarList}`)
      }

      // Vision
      if (userConfig.vision_5year) foundationParts.push(`**5-year vision:** ${userConfig.vision_5year}`)
      if (userConfig.vision_change) foundationParts.push(`**Most wants to change now:** ${userConfig.vision_change}`)
      if (userConfig.vision_gift) foundationParts.push(`**Greatest gift to the world:** ${userConfig.vision_gift}`)

      if (foundationParts.length) {
        ctx += `### User Foundation — background context, never quote back verbatim\n${foundationParts.join('\n')}\n\n`
      }

      // Shadows — handle with extra care
      const shadows = []
      if (userConfig.shadow_pattern) shadows.push(`Pattern they want to break: ${userConfig.shadow_pattern}`)
      if (userConfig.shadow_fear) shadows.push(`Quiet limiting fear: ${userConfig.shadow_fear}`)
      if (userConfig.shadow_admit) shadows.push(`Hard to admit: ${userConfig.shadow_admit}`)
      if (shadows.length) {
        ctx += `### Shadow material — Handle with care and subtlety. Never quote these back verbatim. Let them silently shape the depth of your guidance, surfacing the underlying patterns without naming the specifics.\n${shadows.join('\n')}\n\n`
      }
    }

    const areaNames = LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).map(a => a.title)
    const lensNames = LENSES.filter(l => selectedLenses.includes(l.id)).map(l => l.title)
    ctx += `### Session Focus\nLife Areas Selected: ${areaNames.join(', ') || '(none)'}\n`
    ctx += `Lenses Selected: ${lensNames.length ? lensNames.join(', ') : '(none)'}\n\n`

    LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).forEach(area => {
      const areaInputs = inputs[area.id] || {}
      const lines = area.fields
        .filter(f => areaInputs[f.id]?.trim())
        .map(f => `**${f.label}:** ${areaInputs[f.id].trim()}`)
        .join('\n')
      ctx += `### ${area.title}\n${lines || '*Selected — no specific details provided; offer general insight for this area.*'}\n\n`
    })

    LENSES.filter(l => selectedLenses.includes(l.id)).forEach(lens => {
      const lensInputs = inputs[lens.id] || {}
      let lensCtx = ''

      if (lens.id === 'astrology') {
        const parts = []
        if (profile?.sun_sign) parts.push(`Sun ${profile.sun_sign}`)
        if (profile?.moon_sign) parts.push(`Moon ${profile.moon_sign}`)
        if (profile?.rising_sign) parts.push(`Rising ${profile.rising_sign}`)
        const dobVal = userConfig?.date_of_birth || profile?.date_of_birth
        const placeVal = userConfig?.birth_place || profile?.birth_place
        if (dobVal) parts.push(`DOB ${dobVal}`)
        if (placeVal) parts.push(`Born ${placeVal}`)
        if (parts.length) lensCtx += `*Chart data: ${parts.join(', ')}*\n`
      }
      if (lens.id === 'numerology') {
        const parts = []
        const nameVal = userConfig?.full_name || profile?.full_name
        const dobVal = userConfig?.date_of_birth || profile?.date_of_birth
        if (nameVal) parts.push(`Full Name: ${nameVal}`)
        if (dobVal) parts.push(`DOB: ${dobVal}`)
        if (parts.length) lensCtx += `*From profile: ${parts.join(', ')} — use these to calculate Life Path and interpret numerological cycles.*\n`
      }

      const lines = lens.fields
        .filter(f => lensInputs[f.id]?.trim())
        .map(f => `**${f.label}:** ${lensInputs[f.id].trim()}`)
        .join('\n')
      if (lines) lensCtx += lines
      ctx += `### ${lens.title} (Lens)\n${lensCtx || '*Selected — no additional details; interpret through this lens using profile data and selected life areas.*'}\n\n`
    })

    return ctx.trim()
  }

  const handleSubmit = async () => {
    if (selectedAreas.length === 0) return
    setLoading(true)
    setReading('')
    const ctx = buildContext()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 2500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: ctx }],
        }),
      })
      const data = await res.json()
      const text = data.content?.map(b => b.text || '').join('') || 'No response received.'
      setReading(text)
      setTimeout(() => readingRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      setReading('There was an error connecting to Sage. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!reading || saved) return
    setSaving(true)
    const title = `Session — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    await supabase.from('sessions').insert({ user_id: session.user.id, title, inputs, reading })
    setSaving(false)
    setSaved(true)
  }

  const handleFollowUp = async () => {
    if (!question.trim()) return
    const q = question.trim()
    setQuestion('')
    setAskingFollowUp(true)
    const ctx = buildContext()
    const messages = [
      { role: 'user', content: ctx },
      { role: 'assistant', content: reading },
      ...followUps.flatMap(f => [{ role: 'user', content: f.q }, { role: 'assistant', content: f.a }]),
      { role: 'user', content: q },
    ]
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages,
        }),
      })
      const data = await res.json()
      const answer = data.content?.map(b => b.text || '').join('') || 'No response.'
      setFollowUps(prev => [...prev, { q, a: answer }])
    } catch {
      setFollowUps(prev => [...prev, { q, a: 'There was an error. Please try again.' }])
    }
    setAskingFollowUp(false)
  }

  // ── Styles ──────────────────────────────────────────
  const s = {
    page: { minHeight: '100vh', background: '#0a0805' },

    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.1rem 2rem', borderBottom: '1px solid rgba(200,160,80,0.07)', position: 'sticky', top: 0, background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(12px)', zIndex: 100 },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a050', fontSize: isMobile ? '0.95rem' : '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,160,80,0.1)', border: '1px solid rgba(200,160,80,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a050', flexShrink: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(200,160,80,0.15)', borderRadius: '999px', color: '#7a6e5e', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif" },

    stepBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1rem 1rem' : '1.2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.035)' },
    stepItem: (active, done) => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: active ? '#c8a050' : done ? '#9a7830' : '#3a3028', fontFamily: "'Lora',Georgia,serif", transition: 'color 0.3s' }),
    stepDot: (active, done) => ({ width: '22px', height: '22px', borderRadius: '50%', border: `1.5px solid ${active ? '#c8a050' : done ? '#9a7830' : '#2a2218'}`, background: active ? 'rgba(200,160,80,0.14)' : done ? 'rgba(154,120,48,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: active ? '#c8a050' : done ? '#9a7830' : '#3a3028', flexShrink: 0, transition: 'all 0.3s', fontFamily: "'Cormorant Garamond',Georgia,serif" }),
    stepLine: { width: isMobile ? '22px' : '48px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0.6rem' },

    body: { maxWidth: '860px', margin: '0 auto', padding: isMobile ? '1.75rem 1rem 4rem' : '2.5rem 1.5rem 5rem' },

    selectHeader: { textAlign: 'center', marginBottom: isMobile ? '1.75rem' : '2.25rem' },
    selectTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 'clamp(1.7rem,5.5vw,2.1rem)' : 'clamp(2rem,4vw,2.6rem)', fontWeight: 500, color: '#e8dfc8', marginBottom: '0.5rem', lineHeight: 1.2, letterSpacing: '-0.005em' },
    selectSub: { fontSize: '0.85rem', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' },

    areaGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? '0.6rem' : '0.85rem', marginBottom: '2rem' },
    areaCard: (selected) => ({
      background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '12px',
      padding: isMobile ? '1rem 0.85rem' : '1.3rem 1.2rem',
      cursor: 'pointer', transition: 'all 0.2s',
      minHeight: isMobile ? '140px' : '160px',
      display: 'flex', flexDirection: 'column',
      boxShadow: selected ? '0 0 24px rgba(200,160,80,0.1)' : 'none',
    }),
    areaIcon: { fontSize: isMobile ? '1.7rem' : '2rem', marginBottom: '0.6rem', lineHeight: 1 },
    areaTitle: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 600, color: '#e8dfc8', marginBottom: '0.35rem', lineHeight: 1.2 },
    areaDesc: { fontSize: isMobile ? '0.72rem' : '0.77rem', color: '#7a6e5e', lineHeight: 1.55, fontFamily: "'Lora',Georgia,serif", marginTop: 'auto' },

    lensSection: { marginBottom: '2rem' },
    lensHeading: { fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a7830', marginBottom: '1rem', fontFamily: "'Lora',Georgia,serif" },
    lensRow: { display: 'flex', gap: '0.55rem', flexWrap: 'wrap' },
    lensCard: (selected) => ({
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.55rem 1.05rem',
      background: selected ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1.5px solid ${selected ? '#c8a050' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s',
      boxShadow: selected ? '0 0 16px rgba(200,160,80,0.08)' : 'none',
    }),
    lensIcon: { fontSize: '0.95rem', lineHeight: 1 },
    lensTitle: { fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', color: '#c8bfa8', letterSpacing: '0.02em' },

    beginBtn: { width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg,#c8a050,#9a7830)', border: 'none', borderRadius: '999px', color: '#0a0805', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.3s', boxShadow: '0 4px 24px rgba(200,160,80,0.2)' },

    // Form
    focusChips: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.75rem', color: '#7a6e5e', fontFamily: "'Lora',Georgia,serif" },
    focusChip: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}35`, borderRadius: '999px', color: '#c8bfa8', fontSize: '0.72rem' }),
    changeLink: { background: 'none', border: 'none', padding: 0, color: '#9a7830', fontSize: '0.74rem', cursor: 'pointer', fontFamily: "'Lora',Georgia,serif", textDecoration: 'underline', textDecorationColor: 'rgba(154,120,48,0.3)', textUnderlineOffset: '3px' },

    tab: (active, color) => ({ padding: isMobile ? '0.45rem 0.6rem' : '0.5rem 0.9rem', borderRadius: '8px 8px 0 0', border: `1px solid ${active ? color + '45' : 'rgba(255,255,255,0.06)'}`, borderBottom: active ? '1px solid #0f0d08' : '1px solid rgba(255,255,255,0.06)', background: active ? '#0f0d08' : 'rgba(255,255,255,0.01)', color: active ? color : '#3a3028', cursor: 'pointer', fontSize: isMobile ? '0.7rem' : '0.77rem', fontFamily: "'Lora',Georgia,serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.3rem', position: 'relative', zIndex: active ? 3 : 1, whiteSpace: 'nowrap', flexShrink: 0 }),
    panel: (color) => ({ background: '#0f0d08', border: `1px solid ${color}2a`, borderRadius: '0 10px 10px 10px', padding: isMobile ? '1.1rem 1rem 0.6rem' : '1.6rem 1.6rem 0.8rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }),
    panelTitle: (color) => ({ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', color, fontWeight: 600, marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.4rem' }),
    label: (color) => ({ display: 'block', fontSize: '0.71rem', color: color || '#9a7830', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: "'Lora',Georgia,serif" }),
    textarea: { width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#c8bfa8', fontSize: '0.87rem', lineHeight: 1.7, resize: 'vertical', fontFamily: "'Lora',Georgia,serif", outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' },

    footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' },
    progress: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
    pip: (filled, color) => ({ width: filled ? '22px' : '7px', height: '4px', borderRadius: '2px', background: filled ? color : 'rgba(255,255,255,0.06)', transition: 'all 0.3s' }),
    submitBtn: (enabled) => ({ padding: isMobile ? '0.7rem 1.5rem' : '0.75rem 2rem', background: enabled ? 'linear-gradient(135deg,#c8a050,#9a7830)' : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '999px', color: enabled ? '#0a0805' : '#3a3028', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.9rem', fontWeight: 600, cursor: enabled ? 'pointer' : 'not-allowed', transition: 'all 0.3s', letterSpacing: '0.03em' }),

    readingWrap: { background: 'rgba(200,160,80,0.02)', border: '1px solid rgba(200,160,80,0.1)', borderRadius: '14px', padding: isMobile ? '1.2rem 1rem' : '2rem', marginTop: '2.5rem' },
    readingHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' },
    saveBtn: (saved) => ({ padding: '0.4rem 1.1rem', background: saved ? 'rgba(140,180,140,0.1)' : 'linear-gradient(135deg,#c8a050,#9a7830)', border: saved ? '1px solid rgba(140,180,140,0.25)' : 'none', borderRadius: '999px', color: saved ? '#90b890' : '#0a0805', fontSize: '0.78rem', fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, cursor: saved ? 'default' : 'pointer' }),
    followWrap: { marginTop: '2rem' },
    followDivider: { width: '100%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,160,80,0.2),transparent)', marginBottom: '1.5rem' },
    followInput: { display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px', padding: '0.4rem 0.4rem 0.4rem 1rem' },
    followQ: { color: '#7a6e5e', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: '0.5rem', fontFamily: "'Lora',Georgia,serif" },
    followA: { background: 'rgba(200,160,80,0.02)', border: '1px solid rgba(200,160,80,0.08)', borderRadius: '10px', padding: isMobile ? '1rem' : '1.2rem 1.4rem', marginBottom: '1.5rem' },
  }

  // ── Step indicator (rendered in both views) ──────────
  const stepBar = (
    <div style={s.stepBar}>
      {[['Focus', 1], ['Detail', 2], ['Session', 3]].flatMap(([label, n], i) => {
        const parts = []
        if (i > 0) parts.push(<div key={`l${n}`} style={s.stepLine} />)
        parts.push(
          <div key={`i${n}`} style={s.stepItem(currentStep === n, currentStep > n)}>
            <div style={s.stepDot(currentStep === n, currentStep > n)}>
              {currentStep > n ? '✓' : n}
            </div>
            {!isMobile && label}
          </div>
        )
        return parts
      })}
    </div>
  )

  const navBar = (
    <nav style={s.nav}>
      <div style={s.navLogo} onClick={() => navigate('/dashboard')}>
        <span style={s.navMM}>MM</span>Mystic Madman
      </div>
      <button style={s.navBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </nav>
  )

  const currentTab = allTabs.find(t => t.id === activeTab)

  // ── Selection Step ───────────────────────────────────
  if (step === 'select') {
    return (
      <div style={s.page}>
        {navBar}
        {stepBar}
        <div style={s.body}>
          <div style={s.selectHeader}>
            <h1 style={s.selectTitle}>What would you like to explore today?</h1>
            <p style={s.selectSub}>Select the areas of your life you want to focus on</p>
          </div>

          <div style={s.areaGrid}>
            {LIFE_AREAS.map(area => {
              const selected = selectedAreas.includes(area.id)
              return (
                <div key={area.id} style={s.areaCard(selected)} onClick={() => toggleArea(area.id)}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(200,160,80,0.3)' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <div style={s.areaIcon}>{area.icon}</div>
                  <div style={s.areaTitle}>{area.title}</div>
                  <div style={s.areaDesc}>{area.desc}</div>
                </div>
              )
            })}
          </div>

          {selectedAreas.length > 0 && (
            <div style={s.lensSection} className="sage-fade-in">
              <div style={s.lensHeading}>Want a deeper session? Add a lens.</div>
              <div style={s.lensRow}>
                {LENSES.map(lens => {
                  const selected = selectedLenses.includes(lens.id)
                  return (
                    <div key={lens.id} style={s.lensCard(selected)} onClick={() => toggleLens(lens.id)}>
                      <span style={s.lensIcon}>{lens.icon}</span>
                      <span style={s.lensTitle}>{lens.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedAreas.length > 0 && (
            <button style={s.beginBtn} onClick={handleBeginSession} className="sage-fade-in">
              Begin Session →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Form Step ────────────────────────────────────────
  return (
    <div style={s.page}>
      {navBar}
      {stepBar}
      <div style={s.body}>

        {/* Focus summary + change link */}
        <div style={s.focusChips}>
          <span>Focus:</span>
          {LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).map(a => (
            <span key={a.id} style={s.focusChip(a.color)}>{a.icon} {a.short}</span>
          ))}
          {LENSES.filter(l => selectedLenses.includes(l.id)).map(l => (
            <span key={l.id} style={s.focusChip(l.color)}>{l.icon} {l.short}</span>
          ))}
          <button style={s.changeLink} onClick={() => setStep('select')}>Change</button>
        </div>

        {/* Tab bar */}
        <div className="sage-tabs">
          {allTabs.map(tab => (
            <button key={tab.id} style={s.tab(activeTab === tab.id, tab.color)} onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.short}
              {tabFilled(tab) && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tab.color, flexShrink: 0 }} />}
            </button>
          ))}
        </div>

        {/* Active tab panel */}
        {currentTab && (
          <div style={s.panel(currentTab.color)}>
            <div style={s.panelTitle(currentTab.color)}>
              {currentTab.icon} {currentTab.title}
            </div>
            {currentTab.fields.map(f => (
              <div key={f.id}>
                <label style={s.label(currentTab.color)}>{f.label}</label>
                <textarea
                  style={s.textarea}
                  value={inputs[currentTab.id]?.[f.id] || ''}
                  onChange={e => setField(currentTab.id, f.id, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.progress}>
            {allTabs.map(tab => <div key={tab.id} style={s.pip(tabFilled(tab), tab.color)} />)}
            <span style={{ fontSize: '0.71rem', color: '#3a3028', marginLeft: '0.4rem', fontFamily: "'Lora',Georgia,serif" }}>
              {allTabs.filter(tabFilled).length}/{allTabs.length} filled
            </span>
          </div>
          <button style={s.submitBtn(selectedAreas.length > 0 && !loading)} onClick={handleSubmit} disabled={selectedAreas.length === 0 || loading}>
            {loading ? 'Sage is listening...' : 'Seek Guidance →'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.8rem', fontWeight: 700, animation: 'pulse 2s infinite', color: '#c8a050', letterSpacing: '0.05em' }}>MM</div>
            <p style={{ color: '#7a6e5e', fontStyle: 'italic', fontSize: '0.9rem', marginTop: '0.9rem', fontFamily: "'Lora',Georgia,serif" }}>
              Sage is weaving the threads of your being...
            </p>
            <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`}</style>
          </div>
        )}

        {reading && !loading && (
          <div style={s.readingWrap} ref={readingRef}>
            <div style={s.readingHeader}>
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#e8dfc8', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(200,160,80,0.12)', border: '1px solid rgba(200,160,80,0.3)', fontSize: '0.58rem', color: '#c8a050' }}>MM</span>
                Sage's Session
              </span>
              <button style={s.saveBtn(saved)} onClick={handleSave} disabled={saving || saved}>
                {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Session'}
              </button>
            </div>
            <MarkdownRenderer text={reading} />

            <div style={s.followWrap}>
              <div style={s.followDivider} />
              {followUps.map((f, i) => (
                <div key={i}>
                  <p style={s.followQ}>↳ {f.q}</p>
                  <div style={s.followA}><MarkdownRenderer text={f.a} /></div>
                </div>
              ))}
              <div style={s.followInput}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                  placeholder="Ask Sage a follow-up question..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#c8bfa8', fontSize: '0.87rem', outline: 'none', fontFamily: "'Lora',Georgia,serif" }}
                />
                <button onClick={handleFollowUp} disabled={!question.trim() || askingFollowUp}
                  style={{ padding: '0.48rem 1.1rem', background: '#c8a050', border: 'none', borderRadius: '999px', color: '#0a0805', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, opacity: question.trim() ? 1 : 0.4 }}>
                  {askingFollowUp ? '...' : 'Ask'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
