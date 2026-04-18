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

// ── Numerology helpers ────────────────────────────────
function reduceToSingle(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = String(n).split('').map(Number).reduce((a, b) => a + b, 0)
  return n
}
function calcLifePath(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  return reduceToSingle(reduceToSingle(d) + reduceToSingle(m) + reduceToSingle(y))
}
function calcPersonalYear(dob) {
  if (!dob) return null
  const [, m, d] = dob.split('-').map(Number)
  const cy = new Date().getFullYear()
  return reduceToSingle(reduceToSingle(d) + reduceToSingle(m) + reduceToSingle(cy))
}

// ── System Prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `You are Sage — the perceptive AI mind behind Mystic Madman, a holistic life coach integrating multiple domains of a person's life into unified, actionable guidance.

You will receive structured information including the person's profile, selected life areas, and selected lenses (both Outer practice lenses and Inner depth lenses).

CRITICAL INSTRUCTIONS:
1. Open by briefly acknowledging which life areas and lenses were selected.
2. Structure your response ONLY around selected areas and lenses. Do NOT create sections for unselected ones.
3. For each life area: a focused ## section with honest, specific insight — never generic.
4. For each lens: a dedicated ## section interpreting through that lens.

LENS-SPECIFIC GUIDANCE:

OUTER (Practice) lenses — ground guidance in practical, tangible reality:
- Physical Practice: address training, movement, recovery. Be specific about the body.
- Nutrition & Body Protocols: be concrete about diet, supplements, protocols.
- Money & Finances: address patterns, mindset, and practical steps.
- Creative Practice: honour the creative process. Name what is emerging and what blocks it.
- Contemplative Practice: speak to the quality of inner practice with depth.
- Social & Community: address belonging, connection, isolation with honesty.

INNER (Depth) lenses — go deeper, more symbolic, more interpretive:
- Dreams: interpret specific symbols in context of the person's waking life. Connect to other areas.
- Astrology: use chart data and transits provided. Be specific — name signs, houses, aspects.
- Numerology: reference the calculated Life Path and Personal Year numbers. Connect cycles to lived experience.
- Intuitive: honour gut knowing. Name what the rational mind is overriding.
- Tarot & Oracle: interpret the SPECIFIC cards named in context of everything else shared. Do not give generic card meanings — give a reading for THIS person in THIS moment. Reference upright/reversed if noted.
- Human Design: use the type, strategy and authority to contextualise guidance. A Generator needs different advice than a Projector. A Sacral authority person needs different framing than Emotional authority.
- Shadow Work: approach with care and precision. Name the archetype. Connect projections to inner dynamics. Always find the gift in the shadow.
- Lunar & Cycles: connect moon phase and season to what is happening. New moon = intentions/planting, Full moon = culmination/release, Waning = letting go/rest, Waxing = building/action.

Always end with:
## 🎯 Focus for Now — 3 to 5 concrete, prioritised actions
## 💬 A Word from Sage — a brief, personal closing message

Use markdown ## headings and **bold**. Speak with warmth, wisdom, and directness.`

// ── Life Areas (unchanged) ────────────────────────────
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

// ── The Outer — Practice Lenses ───────────────────────
const OUTER_LENSES = [
  { id: 'physical', icon: '🏃', short: 'Physical', title: 'Physical Practice', desc: 'Training, sport, movement and recovery', color: '#a0c4a0',
    fields: [
      { id: 'practice', label: 'Current practice', placeholder: 'What does your physical practice look like right now? What are you training, how often, how does it feel?' },
      { id: 'performance', label: 'Performance and energy', placeholder: 'How is your body performing? Any breakthroughs, plateaus, injuries, or fatigue?' },
      { id: 'recovery', label: 'Recovery', placeholder: 'How are you recovering? Sleep, soreness, stress on the body?' },
      { id: 'attention', label: 'What needs attention', placeholder: 'What is your body asking for that you are not yet giving it?' },
    ] },
  { id: 'nutrition', icon: '🍃', short: 'Nutrition', title: 'Nutrition & Body Protocols', desc: 'Diet, supplements, sleep protocols, biohacking', color: '#90b890',
    fields: [
      { id: 'nutrition', label: 'Current nutrition', placeholder: 'What does your diet look like right now? Any patterns, cravings, or changes?' },
      { id: 'protocols', label: 'Supplements and protocols', placeholder: 'What are you taking or doing deliberately — supplements, cold exposure, fasting, sleep protocols?' },
      { id: 'working', label: 'What is working', placeholder: 'What feels good in how you are fuelling and caring for your body?' },
      { id: 'adjusting', label: 'What needs adjusting', placeholder: 'What do you know you should change but haven\'t yet?' },
    ] },
  { id: 'money', icon: '💰', short: 'Money', title: 'Money & Finances', desc: 'Financial state, stress, goals and patterns', color: '#c8b870',
    fields: [
      { id: 'situation', label: 'Current financial situation', placeholder: 'How does your financial life look and feel right now? Abundant, stressed, stagnant, growing?' },
      { id: 'patterns', label: 'Money patterns', placeholder: 'What patterns do you notice in how you earn, spend, save, or avoid money?' },
      { id: 'goals', label: 'Financial goals', placeholder: 'What are you building toward financially? What would feel like meaningful progress?' },
      { id: 'mindset', label: 'Money mindset', placeholder: 'What beliefs about money feel most alive or most limiting right now?' },
    ] },
  { id: 'creative', icon: '🎨', short: 'Creative', title: 'Creative Practice', desc: 'Art, writing, music, building and making', color: '#c8a0c0',
    fields: [
      { id: 'creating', label: 'What you are creating', placeholder: 'What creative work are you engaged in right now? What are you making, building, or expressing?' },
      { id: 'flow', label: 'How it is flowing', placeholder: 'Is the creative energy alive and moving, or blocked and stuck? What is the texture of it right now?' },
      { id: 'emerging', label: 'What is emerging', placeholder: 'What new ideas, directions, or projects are trying to come through?' },
      { id: 'blocking', label: 'What is in the way', placeholder: 'What is blocking or limiting your creative expression right now?' },
    ] },
  { id: 'contemplative', icon: '🧘', short: 'Contemplative', title: 'Contemplative Practice', desc: 'Meditation, breathwork, prayer and inner practice', color: '#a0a8c8',
    fields: [
      { id: 'practice', label: 'Your practice', placeholder: 'What contemplative or inner practices are you doing regularly? Meditation, breathwork, prayer, journalling, ritual?' },
      { id: 'quality', label: 'Quality and depth', placeholder: 'How has the quality of your practice been lately? Deep and nourishing, or dry and mechanical?' },
      { id: 'arising', label: 'What is arising', placeholder: 'What experiences, insights, or challenges are coming up in your practice?' },
      { id: 'asking', label: 'What your practice is asking of you', placeholder: 'What does your inner practice seem to be pointing toward or asking you to face?' },
    ] },
  { id: 'social', icon: '🤝', short: 'Social', title: 'Social & Community', desc: 'Friendships, social life and sense of belonging', color: '#c4a090',
    fields: [
      { id: 'landscape', label: 'Social landscape', placeholder: 'How would you describe your social world right now? Rich, depleted, changing, isolating, nourishing?' },
      { id: 'relationships', label: 'Key relationships', placeholder: 'Which friendships or connections feel most alive, most challenging, or most important right now?' },
      { id: 'belonging', label: 'Sense of belonging', placeholder: 'Do you feel part of a community or tribe? Or searching for your people?' },
      { id: 'need', label: 'What you need', placeholder: 'What does your social and community life need more of, or less of, right now?' },
    ] },
]

// ── The Inner — Depth Lenses ──────────────────────────
const INNER_LENSES = [
  { id: 'dreams', icon: '🌙', short: 'Dreams', title: 'Dreams', desc: 'Unconscious material, symbols and night visions', color: '#8b9fc2',
    fields: [
      { id: 'recent', label: 'Recent dreams', placeholder: 'Describe your most recent or most memorable dreams in as much detail as you can recall' },
      { id: 'recurring', label: 'Recurring themes', placeholder: 'Any symbols, places, people, or situations that appear repeatedly in your dreams?' },
      { id: 'emotions', label: 'Dream emotions', placeholder: 'How do you feel during and after your dreams? What emotional residue do they leave?' },
      { id: 'symbols', label: 'Specific symbols', placeholder: 'Any particular objects, animals, colours, or numbers that stood out?' },
    ] },
  { id: 'astrology', icon: '✨', short: 'Astrology', title: 'Astrology', desc: 'Your chart, current transits and cosmic weather', color: '#b8a0d4',
    fields: [
      { id: 'transits', label: 'Current transits or themes', placeholder: 'Any transits you are aware of? Saturn return, Mercury retrograde, eclipses? Or cosmic themes that feel relevant.' },
      { id: 'placements', label: 'Additional placements', placeholder: 'Any placements beyond what is in your profile — Venus, Mars, Mercury, nodes, houses?' },
      { id: 'questions', label: 'Questions for Sage', placeholder: 'What specific astrological question or area would you like Sage to focus on?' },
    ] },
  { id: 'numerology', icon: '🔢', short: 'Numerology', title: 'Numerology', desc: 'Life path, personal year and name numbers', color: '#d4c07e',
    fields: [
      { id: 'patterns', label: 'Number patterns', placeholder: 'Do certain numbers keep appearing — on clocks, receipts, addresses, dates? Which ones and in what contexts?' },
      { id: 'known', label: 'Numbers you know', placeholder: 'If you know any of your core numbers — Life Path, Expression, Soul Urge, Personal Year — share them here' },
      { id: 'questions', label: 'Numerical questions', placeholder: 'Any specific numerical cycle or pattern you would like Sage to interpret?' },
    ] },
  { id: 'intuitive', icon: '🔮', short: 'Intuitive', title: 'Intuitive', desc: 'Gut knowing, subtle perception and inner sensing', color: '#c8a0d0',
    fields: [
      { id: 'gut', label: 'What your intuition is saying', placeholder: 'What does your gut keep trying to tell you that your rational mind keeps dismissing or overriding?' },
      { id: 'signs', label: 'Subtle signs and synchronicities', placeholder: 'Any meaningful coincidences, repeated encounters, or signs in waking life that feel significant?' },
      { id: 'sense', label: 'What you sense but cannot yet articulate', placeholder: 'What do you feel to be true that you cannot yet put into words?' },
    ] },
  { id: 'tarot', icon: '🃏', short: 'Tarot', title: 'Tarot & Oracle', desc: 'Cards drawn, spreads and their symbolism', color: '#c0a098',
    fields: [
      { id: 'cards', label: 'Cards drawn', placeholder: 'Which card or cards did you draw? Name them and note upright or reversed if relevant.' },
      { id: 'spread', label: 'The spread or context', placeholder: 'Was this a single card pull, three-card spread, Celtic cross? What question were you asking?' },
      { id: 'reaction', label: 'Your immediate reaction', placeholder: 'What was your gut response when you saw the cards? What stood out immediately?' },
      { id: 'unresolved', label: 'What feels unresolved', placeholder: 'What aspect of the card\'s meaning feels most relevant but also most uncomfortable or confusing?' },
    ] },
  { id: 'humandesign', icon: '☯️', short: 'HD', title: 'Human Design', desc: 'Your type, strategy, authority and centres', color: '#a0b0c8',
    fields: [
      { id: 'type', label: 'Your type and strategy', placeholder: 'What is your HD type — Generator, MG, Projector, Manifestor, Reflector — and your strategy?' },
      { id: 'authority', label: 'Your authority', placeholder: 'What is your inner authority — Sacral, Emotional, Splenic, Ego, Self-Projected, Mental, Lunar?' },
      { id: 'centres', label: 'Defined and open centres', placeholder: 'Which centres are defined and which open or undefined? Where do you feel most conditioned?' },
      { id: 'themes', label: 'Current Human Design themes', placeholder: 'What aspects of your design feel most alive, challenging, or relevant right now?' },
    ] },
  { id: 'shadow', icon: '🌑', short: 'Shadow', title: 'Shadow Work', desc: 'Archetypes, projections and what lives in the dark', color: '#908080',
    fields: [
      { id: 'projecting', label: 'What you are projecting', placeholder: 'What qualities in others are you most triggered by, most admiring of, or most repelled by? These are often mirrors.' },
      { id: 'archetype', label: 'The archetype present', placeholder: 'If your current situation were a mythological or archetypal story, what story would it be? Who are you playing?' },
      { id: 'integrating', label: 'What is being asked to integrate', placeholder: 'What quality, feeling, or part of yourself are you most resisting or denying right now?' },
      { id: 'gift', label: 'The gift in the shadow', placeholder: 'What strength or wisdom might be hidden inside the thing you most want to avoid looking at?' },
    ] },
  { id: 'lunar', icon: '🌿', short: 'Lunar', title: 'Lunar & Cycles', desc: 'Moon phases, seasons and natural rhythms', color: '#a8b8a0',
    fields: [
      { id: 'phase', label: 'Current lunar phase', placeholder: 'What phase is the moon in? New, waxing, full, waning? How does that feel in your body and energy?' },
      { id: 'seasonal', label: 'Seasonal energy', placeholder: 'What season are you in — literally and energetically? What is completing and what is beginning?' },
      { id: 'personal', label: 'Personal cycles', placeholder: 'Any personal rhythms — monthly, quarterly, annual — that feel relevant right now?' },
      { id: 'asking', label: 'What the cycle is asking', placeholder: 'What does the current natural cycle seem to be inviting you to do, release, begin, or honour?' },
    ] },
]

const ALL_LENSES = [...OUTER_LENSES, ...INNER_LENSES]

const LOADING_MSGS = [
  'Sage is weaving the threads of your being...',
  'Consulting your stars...',
  'Reading between the lines...',
  'Listening to what you haven\'t said...',
  'Connecting the patterns...',
]

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

// ── Section divider with centred label ─────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '2rem 0 1.2rem' }}>
      <div style={{ flex: 1, height: 1, background: C.borderGold }} />
      <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.goldMuted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.borderGold }} />
    </div>
  )
}

function LensRowLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem', marginTop: '0.6rem' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(200,160,80,0.1)' }} />
      <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.goldMuted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(200,160,80,0.1)' }} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────
export default function Session({ session }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [userConfig, setUserConfig] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [stage, setStage] = useState('focus')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [selectedLenses, setSelectedLenses] = useState([])
  const [currentInputIdx, setCurrentInputIdx] = useState(0)
  const [inputs, setInputs] = useState(() => {
    const o = {}
    ;[...LIFE_AREAS, ...ALL_LENSES].forEach(item => { o[item.id] = {}; item.fields.forEach(f => { o[item.id][f.id] = '' }) })
    return o
  })
  const [reading, setReading] = useState('')
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

  const allTabs = [
    ...LIFE_AREAS.filter(a => selectedAreas.includes(a.id)),
    ...ALL_LENSES.filter(l => selectedLenses.includes(l.id)),
  ]
  const currentTab = allTabs[currentInputIdx]
  const toggleArea = (id) => setSelectedAreas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleLens = (id) => setSelectedLenses(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const setField = (tabId, fieldId, val) => setInputs(p => ({ ...p, [tabId]: { ...p[tabId], [fieldId]: val } }))

  const transition = (next) => {
    setFadeIn(false)
    setTimeout(() => { setStage(next); setFadeIn(true); window.scrollTo({ top: 0, behavior: 'instant' }) }, 250)
  }
  const handleBeginSession = () => { setCurrentInputIdx(0); transition('input') }

  // ── Build context ───────────────────────────────────
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
    const outerNames = OUTER_LENSES.filter(l => selectedLenses.includes(l.id)).map(l => l.title)
    const innerNames = INNER_LENSES.filter(l => selectedLenses.includes(l.id)).map(l => l.title)
    ctx += `### Session Focus\nLife Areas: ${areaNames.join(', ') || '(none)'}\nOuter Lenses: ${outerNames.join(', ') || '(none)'}\nInner Lenses: ${innerNames.join(', ') || '(none)'}\n\n`

    LIFE_AREAS.filter(a => selectedAreas.includes(a.id)).forEach(area => {
      const ai = inputs[area.id] || {}
      const lines = area.fields.filter(f => ai[f.id]?.trim()).map(f => `**${f.label}:** ${ai[f.id].trim()}`).join('\n')
      ctx += `### ${area.title}\n${lines || '*Selected — no details*'}\n\n`
    })

    ALL_LENSES.filter(l => selectedLenses.includes(l.id)).forEach(lens => {
      const li = inputs[lens.id] || {}; let lc = ''
      if (lens.id === 'astrology') {
        const p = []; if (profile?.sun_sign) p.push(`Sun ${profile.sun_sign}`); if (profile?.moon_sign) p.push(`Moon ${profile.moon_sign}`); if (profile?.rising_sign) p.push(`Rising ${profile.rising_sign}`)
        if (dob) p.push(`DOB ${dob}`); if (userConfig?.time_of_birth) p.push(`Time ${userConfig.time_of_birth}`)
        const bp = userConfig?.birth_place || profile?.birth_place; if (bp) p.push(`Born ${bp}`)
        if (p.length) lc += `*Chart data: ${p.join(', ')}*\n`
      }
      if (lens.id === 'numerology') {
        const bn = userConfig?.full_name || profile?.full_name
        const p = []; if (bn) p.push(`Birth name: ${bn}`); if (userConfig?.current_name) p.push(`Current: ${userConfig.current_name}`)
        if (dob) p.push(`DOB: ${dob}`)
        const lp = calcLifePath(dob); if (lp) p.push(`Life Path: ${lp}`)
        const py = calcPersonalYear(dob); if (py) p.push(`Personal Year: ${py}`)
        if (p.length) lc += `*Calculated: ${p.join(', ')}*\n`
      }
      const lines = lens.fields.filter(f => li[f.id]?.trim()).map(f => `**${f.label}:** ${li[f.id].trim()}`).join('\n')
      if (lines) lc += lines
      const cat = OUTER_LENSES.find(o => o.id === lens.id) ? 'Outer' : 'Inner'
      ctx += `### ${lens.title} (${cat} Lens)\n${lc || '*Selected — no extra details*'}\n\n`
    })
    return ctx.trim()
  }

  const handleSubmit = async () => {
    if (selectedAreas.length === 0) return
    transition('loading'); setReading('')
    const ctx = buildContext()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 3000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: ctx }] }),
      })
      const data = await res.json()
      setReading(data.content?.map(b => b.text || '').join('') || 'No response received.')
    } catch { setReading('There was an error connecting to Sage. Please try again.') }
    transition('reading')
  }

  const handleSave = async () => {
    if (!reading || saved) return; setSaving(true)
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
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1200, system: SYSTEM_PROMPT, messages }) })
      const data = await res.json()
      setFollowUps(p => [...p, { q, a: data.content?.map(b => b.text || '').join('') || 'No response.' }])
    } catch { setFollowUps(p => [...p, { q, a: 'There was an error. Please try again.' }]) }
    setAskingFollowUp(false)
  }

  // ── Styles ──────────────────────────────────────────
  const fadeStyle = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }
  const areaCard = (selected) => ({
    background: selected ? C.goldFaint : C.surface, border: `1.5px solid ${selected ? C.gold : C.border}`,
    borderRadius: 12, padding: '1.2rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: 160,
    display: 'flex', flexDirection: 'column', position: 'relative',
  })
  const lensCard = (selected) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.9rem', borderRadius: 999, minWidth: 'fit-content',
    background: selected ? C.goldFaint : C.surface,
    border: `1.5px solid ${selected ? C.gold : C.border}`,
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Lora',Georgia,serif", fontSize: '0.8rem',
    color: selected ? C.gold : C.text,
  })
  const goldBtn = (active) => ({
    padding: '0.85rem 2.2rem',
    background: active ? `linear-gradient(135deg,${C.gold},${C.goldMuted})` : C.surface,
    border: 'none', borderRadius: 999, color: active ? '#0f0c08' : C.textDim,
    fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1rem', fontWeight: 700,
    cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.4,
    transition: 'all 0.3s', letterSpacing: '0.03em',
  })
  const textareaStyle = {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '0.75rem 0.95rem', color: C.text, fontSize: '0.92rem', lineHeight: 1.8,
    resize: 'vertical', fontFamily: "'Lora',Georgia,serif", outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  return (
    <AppShell session={session} pageName="New Session">
      {/* ── FOCUS ─────────────────────────────────── */}
      {stage === 'focus' && (
        <div style={fadeStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, color: C.text, marginBottom: '0.5rem' }}>What would you like to explore?</h1>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.9rem', color: C.textSec, fontStyle: 'italic' }}>Select the areas calling for attention today</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
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

          {/* ── Lens section ── */}
          <SectionDivider label="Deepen your reading" />

          <LensRowLabel label="The Outer" />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            {OUTER_LENSES.map(l => {
              const sel = selectedLenses.includes(l.id)
              return <button key={l.id} style={lensCard(sel)} onClick={() => toggleLens(l.id)}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.borderMed }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border }}>
                <span style={{ fontSize: '0.92rem' }}>{l.icon}</span>{l.short}
              </button>
            })}
          </div>

          <LensRowLabel label="The Inner" />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {INNER_LENSES.map(l => {
              const sel = selectedLenses.includes(l.id)
              return <button key={l.id} style={lensCard(sel)} onClick={() => toggleLens(l.id)}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.borderMed }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border }}>
                <span style={{ fontSize: '0.92rem' }}>{l.icon}</span>{l.short}
              </button>
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button style={goldBtn(selectedAreas.length > 0)} onClick={selectedAreas.length > 0 ? handleBeginSession : undefined} disabled={selectedAreas.length === 0}>Begin Session →</button>
            <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem', color: C.textDim, marginTop: '0.7rem' }}>Session {sessionCount + 1} of your journey</p>
          </div>
        </div>
      )}

      {/* ── INPUT ─────────────────────────────────── */}
      {stage === 'input' && currentTab && (
        <div style={fadeStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {allTabs.map((t, i) => (
              <div key={t.id} onClick={() => setCurrentInputIdx(i)} style={{
                padding: '0.35rem 0.75rem', borderRadius: 999, cursor: 'pointer',
                background: i === currentInputIdx ? C.goldFaint : 'transparent',
                border: `1px solid ${i === currentInputIdx ? C.borderGold : 'transparent'}`,
                fontFamily: "'Lora',Georgia,serif", fontSize: '0.7rem',
                color: i === currentInputIdx ? C.gold : C.textMuted, transition: 'all 0.2s',
              }}>{t.icon} {t.short}</div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.5rem', padding: '1rem 1.2rem', background: `${currentTab.color}10`, borderRadius: 12, border: `1px solid ${currentTab.color}25` }}>
            <span style={{ fontSize: '1.8rem' }}>{currentTab.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.2rem', fontWeight: 600, color: C.text }}>{currentTab.title}</div>
              <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', color: C.textSec }}>{currentTab.desc}</div>
            </div>
          </div>

          {currentTab.fields.map(f => (
            <div key={f.id} style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontFamily: "'Lora',Georgia,serif", fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: currentTab.color, marginBottom: '0.45rem' }}>{f.label}</label>
              <textarea style={textareaStyle} value={inputs[currentTab.id]?.[f.id] || ''} onChange={e => setField(currentTab.id, f.id, e.target.value)} placeholder={f.placeholder} rows={3}
                onFocus={e => e.target.style.borderColor = C.borderGold} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => { if (currentInputIdx > 0) setCurrentInputIdx(currentInputIdx - 1); else transition('focus') }}
              style={{ padding: '0.7rem 1.4rem', background: 'none', border: `1px solid ${C.borderGold}`, borderRadius: 999, color: C.textSec, fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', cursor: 'pointer' }}>
              ← {currentInputIdx > 0 ? 'Back' : 'Areas'}
            </button>
            {currentInputIdx < allTabs.length - 1 ? (
              <button onClick={() => setCurrentInputIdx(currentInputIdx + 1)} style={{ ...goldBtn(true), padding: '0.7rem 1.6rem' }}>
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

      {/* ── LOADING ───────────────────────────────── */}
      {stage === 'loading' && (
        <div style={{ ...fadeStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.goldFaint, border: `1.5px solid ${C.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 3s ease-in-out infinite' }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.6rem', fontWeight: 700, color: C.gold }}>MM</span>
          </div>
          <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.92rem', fontStyle: 'italic', color: C.textSec, marginTop: '1.5rem', minHeight: '1.5rem' }}>{LOADING_MSGS[loadingMsg]}</p>
          <style>{`@keyframes breathe{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.05);opacity:1}}`}</style>
        </div>
      )}

      {/* ── READING ───────────────────────────────── */}
      {stage === 'reading' && (
        <div style={fadeStyle}>
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
              style={{ padding: '0.4rem 1.2rem', borderRadius: 999, background: saved ? 'rgba(140,180,140,0.1)' : `linear-gradient(135deg,${C.gold},${C.goldMuted})`, border: saved ? '1px solid rgba(140,180,140,0.25)' : 'none', color: saved ? '#90b890' : '#0f0c08', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.82rem', fontWeight: 700, cursor: saved ? 'default' : 'pointer' }}>
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
              <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFollowUp()} placeholder="Ask Sage anything about your reading..."
                style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: '0.88rem', outline: 'none', fontFamily: "'Lora',Georgia,serif" }} />
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
