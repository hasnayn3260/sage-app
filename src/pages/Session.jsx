import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const SYSTEM_PROMPT = `You are Sage — a deeply perceptive holistic life coach who integrates physical health, emotional wellbeing, dream symbolism, psychological depth, astrology, and numerology into unified, actionable guidance.

When given structured information about someone, you:
1. Identify patterns and connections across ALL domains — physical, mental, spiritual, cosmic
2. Interpret dream symbols in context of their waking life
3. Connect astrological transits and numerological cycles to their current situation
4. Surface underlying themes the person may not have noticed
5. Provide specific, prioritised actions for body, mind, and spirit
6. Speak with warmth, wisdom, and gentle directness — never generic platitudes

Structure your response with these sections (use markdown):

## 🌿 Overall State of Being
A synthesised read of where this person is right now — body, mind, and spirit as one picture.

## 🔮 Dream Insights
What their dreams reveal, connected to their waking situation and current cycles.

## 🧠 Psychological & Emotional Patterns
Key themes, what they signal, and what may be asking for attention beneath the surface.

## 🫀 Physical Guidance
Body-specific recommendations based on their health data — energy, sleep, nutrition, movement.

## ✨ Astrological Guidance
How their chart and current cosmic weather connects to what they are experiencing and what is coming.

## 🔢 Numerological Insight
What their personal numbers reveal about this phase of life. Calculate their Life Path number from their date of birth if provided.

## 🎯 Your Focus for Now
3-5 concrete, prioritised actions to take in the coming days and weeks — specific and actionable.

## 💬 A Word from Sage
A brief, personal closing message — compassionate, honest, and specific to them.

Be substantive. Be specific. Avoid vague wellness cliches. Treat the person as intelligent and capable.`

const SECTIONS = [
  {
    id: 'health', label: 'Physical Health', icon: '🫀', color: '#c8a97e',
    fields: [
      { id: 'energy', label: 'Energy Levels', placeholder: 'How is your energy day to day? Morning vs evening? Crashes after meals? Feeling fatigued or vital?' },
      { id: 'sleep', label: 'Sleep Quality', placeholder: 'How many hours? Do you wake in the night? Feel rested? Any recurring patterns like waking at 3am?' },
      { id: 'diet', label: 'Diet & Nutrition', placeholder: 'What does your typical diet look like? Any foods you are avoiding or craving? Digestive issues?' },
      { id: 'exercise', label: 'Movement & Exercise', placeholder: 'How often and what type? Do you enjoy it or dread it? Any physical limitations?' },
      { id: 'symptoms', label: 'Symptoms & Concerns', placeholder: 'Any pain, tension, illness, or recurring physical patterns? Where does your body hold stress?' },
    ],
  },
  {
    id: 'dreams', label: 'Dream Journal', icon: '🌙', color: '#8b9fc2',
    fields: [
      { id: 'recent', label: 'Recent Dreams', placeholder: 'Describe your most recent or memorable dreams in as much detail as you can recall...' },
      { id: 'recurring', label: 'Recurring Themes', placeholder: 'Are there symbols, places, people, or situations that appear repeatedly in your dreams?' },
      { id: 'emotions', label: 'Dream Emotions', placeholder: 'How do you feel during and after your dreams? Anxious, peaceful, confused, exhilarated?' },
      { id: 'symbols', label: 'Specific Symbols', placeholder: 'Any particular objects, animals, colours, or numbers that stood out in recent dreams?' },
    ],
  },
  {
    id: 'psychology', label: 'Mind & Emotions', icon: '🧠', color: '#a8c4a2',
    fields: [
      { id: 'mood', label: 'Current Mood & Emotional State', placeholder: 'How would you describe your general emotional climate lately? What feelings come up most?' },
      { id: 'anxiety', label: 'Anxieties & Fears', placeholder: 'What worries are occupying your mind? Any fears, old or new, that feel present right now?' },
      { id: 'thoughts', label: 'Recurring Thoughts', placeholder: 'What thoughts keep returning? What narratives do you tell yourself about your life?' },
      { id: 'relationships', label: 'Relationships & Connections', placeholder: 'How are your key relationships — partner, family, friends, colleagues? Any tensions or joys?' },
      { id: 'selfimage', label: 'Self-Perception', placeholder: 'How do you see yourself right now? What do you like or struggle with about who you are?' },
    ],
  },
  {
    id: 'goals', label: 'Goals & Life Context', icon: '🎯', color: '#d4a5a5',
    fields: [
      { id: 'pursuing', label: 'What You Are Pursuing', placeholder: 'What goals, projects, or visions are you actively working toward?' },
      { id: 'stuck', label: 'What Feels Stuck', placeholder: 'Where do you feel blocked, stagnant, or like you keep hitting the same wall?' },
      { id: 'transitions', label: 'Life Transitions & Events', placeholder: 'Any major changes, endings, or beginnings — career, relationships, home, health?' },
      { id: 'wanting', label: 'What You Want More Of', placeholder: 'If you could shift one thing about your daily life or inner world, what would it be?' },
    ],
  },
  {
    id: 'astrology', label: 'Astrology', icon: '✨', color: '#b8a0d4',
    fields: [
      { id: 'transits', label: 'Current Transits or Themes', placeholder: 'Any transits you are aware of? e.g. Saturn return, Mercury retrograde. Or describe what cosmic themes feel relevant.' },
      { id: 'placements', label: 'Additional Placements', placeholder: 'Any other placements you know — Venus, Mars, Mercury signs, dominant houses, stelliums, etc.' },
    ],
  },
  {
    id: 'numerology', label: 'Numerology', icon: '🔢', color: '#d4c07e',
    fields: [
      { id: 'patterns', label: 'Number Patterns in Your Life', placeholder: 'Do certain numbers keep appearing — on clocks, receipts, addresses? Any numbers that feel significant?' },
      { id: 'knownnumbers', label: 'Numbers You Already Know', placeholder: 'If you know your Life Path, Expression, or other numbers, share them here.' },
    ],
  },
]

function MarkdownRenderer({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.15rem', color: '#c8a97e', marginTop: '1.8rem', marginBottom: '0.6rem', borderBottom: '1px solid rgba(200,169,126,0.15)', paddingBottom: '0.4rem', fontWeight: 600 }}>{line.replace('## ', '')}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.95rem', color: '#e8d5b0', marginTop: '0.9rem', marginBottom: '0.3rem' }}>{line.replace('### ', '')}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.35rem', paddingLeft: '0.3rem' }}><span style={{ color: '#c8a97e', flexShrink: 0, marginTop: '3px' }}>◆</span><span style={{ color: '#d4c5a9', lineHeight: 1.75 }}>{line.replace(/^[-•] /, '')}</span></div>
        if (line.match(/^\d+\. /)) { const num = line.match(/^(\d+)\./)[1]; return <div key={i} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.4rem', paddingLeft: '0.3rem' }}><span style={{ color: '#c8a97e', fontWeight: 700, flexShrink: 0, minWidth: '1.2rem' }}>{num}.</span><span style={{ color: '#d4c5a9', lineHeight: 1.75 }}>{line.replace(/^\d+\. /, '')}</span></div> }
        if (line.trim() === '') return <div key={i} style={{ height: '0.35rem' }} />
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return <p key={i} style={{ color: '#b8b0a0', lineHeight: 1.8, marginBottom: '0.25rem' }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#e0d0b8' }}>{p}</strong> : p)}</p>
      })}
    </div>
  )
}

export default function Session({ session }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [activeSection, setActiveSection] = useState('health')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [inputs, setInputs] = useState(() => {
    const o = {}
    SECTIONS.forEach(s => { o[s.id] = {}; s.fields.forEach(f => { o[s.id][f.id] = '' }) })
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
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data))
  }, [session])

  const setField = (sectionId, fieldId, val) =>
    setInputs(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [fieldId]: val } }))

  const sectionFilled = (s) => s.fields.some(f => inputs[s.id][f.id].trim().length > 0)
  const filledSections = SECTIONS.filter(sectionFilled)

  const buildContext = () => {
    let ctx = ''
    if (profile) {
      const parts = []
      if (profile.full_name) parts.push(`Name: ${profile.full_name}`)
      if (profile.date_of_birth) parts.push(`Date of Birth: ${profile.date_of_birth}`)
      if (profile.birth_place) parts.push(`Birth Place: ${profile.birth_place}`)
      if (profile.sun_sign) parts.push(`Sun Sign: ${profile.sun_sign}`)
      if (profile.moon_sign) parts.push(`Moon Sign: ${profile.moon_sign}`)
      if (profile.rising_sign) parts.push(`Rising Sign: ${profile.rising_sign}`)
      if (parts.length > 0) ctx += `### Profile\n${parts.join('\n')}\n\n`
    }
    SECTIONS.filter(sectionFilled).forEach(s => {
      const fieldLines = s.fields.filter(f => inputs[s.id][f.id].trim()).map(f => `**${f.label}:** ${inputs[s.id][f.id].trim()}`).join('\n')
      ctx += `### ${s.label}\n${fieldLines}\n\n`
    })
    return ctx.trim()
  }

  const handleSubmit = async () => {
    if (filledSections.length === 0) return
    setLoading(true)
    setReading('')
    const ctx = buildContext()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: ctx }] }),
      })
      const data = await res.json()
      const text = data.content?.map(b => b.text || '').join('') || 'No response received.'
      setReading(text)
      setTimeout(() => readingRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setReading('There was an error connecting to Sage. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!reading || saved) return
    setSaving(true)
    const title = `Reading — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
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
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1000, system: SYSTEM_PROMPT, messages }),
      })
      const data = await res.json()
      const answer = data.content?.map(b => b.text || '').join('') || 'No response.'
      setFollowUps(prev => [...prev, { q, a: answer }])
    } catch {
      setFollowUps(prev => [...prev, { q, a: 'There was an error. Please try again.' }])
    }
    setAskingFollowUp(false)
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection)

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0d0f0a 0%, #111409 40%, #0a0d12 100%)' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a97e', fontSize: isMobile ? '0.95rem' : '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,169,126,0.1)', border: '1px solid rgba(200,169,126,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a97e', flexShrink: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: 0 },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', color: '#5a5248', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer' },
    body: { maxWidth: '820px', margin: '0 auto', padding: isMobile ? '1.5rem 1rem 3rem' : '3rem 1.5rem 5rem' },
    header: { textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '2.5rem' },
    title: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: '#e8d5b0', marginBottom: '0.4rem' },
    sub: { color: '#5a5248', fontSize: isMobile ? '0.82rem' : '0.88rem', fontStyle: 'italic' },
    tab: (active, color) => ({ padding: isMobile ? '0.45rem 0.6rem' : '0.5rem 0.9rem', borderRadius: '8px 8px 0 0', border: `1px solid ${active ? color + '50' : 'rgba(255,255,255,0.06)'}`, borderBottom: active ? '1px solid #0f120c' : '1px solid rgba(255,255,255,0.06)', background: active ? '#0f120c' : 'rgba(255,255,255,0.01)', color: active ? color : '#3a3428', cursor: 'pointer', fontSize: isMobile ? '0.72rem' : '0.78rem', fontFamily: "'Lora',Georgia,serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.25rem', position: 'relative', zIndex: active ? 3 : 1, whiteSpace: 'nowrap', flexShrink: 0 }),
    panel: (color) => ({ background: '#0f120c', border: `1px solid ${color}35`, borderRadius: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', padding: isMobile ? '1rem 1rem 0.6rem' : '1.5rem 1.5rem 0.8rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }),
    panelHeader: { display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '0.3rem', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    label: { display: 'block', fontSize: '0.72rem', color: '#c8a97e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#c8bfb0', fontSize: '0.87rem', lineHeight: 1.7, resize: 'vertical', fontFamily: "'Lora',Georgia,serif", outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' },
    footer: { display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' },
    progress: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
    pip: (filled, color) => ({ width: filled ? '22px' : '7px', height: '4px', borderRadius: '2px', background: filled ? color : 'rgba(255,255,255,0.07)', transition: 'all 0.3s' }),
    submitBtn: (enabled) => ({ padding: isMobile ? '0.7rem 1.5rem' : '0.75rem 2rem', background: enabled ? 'linear-gradient(135deg,#c8a97e,#a0845e)' : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '999px', color: enabled ? '#0d0f0a' : '#3a3428', fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.9rem', fontWeight: 600, cursor: enabled ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }),
    readingWrap: { background: 'rgba(200,169,126,0.025)', border: '1px solid rgba(200,169,126,0.1)', borderRadius: '14px', padding: isMobile ? '1.2rem 1rem' : '2rem', marginTop: '2.5rem' },
    readingHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' },
    saveBtn: (saved) => ({ padding: '0.4rem 1.1rem', background: saved ? 'rgba(168,196,162,0.15)' : 'linear-gradient(135deg,#c8a97e,#a0845e)', border: saved ? '1px solid rgba(168,196,162,0.3)' : 'none', borderRadius: '999px', color: saved ? '#a8c4a2' : '#0d0f0a', fontSize: '0.78rem', fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600, cursor: saved ? 'default' : 'pointer' }),
    followWrap: { marginTop: '2rem' },
    followDivider: { width: '100%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,169,126,0.2),transparent)', marginBottom: '1.5rem' },
    followInput: { display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '999px', padding: '0.4rem 0.4rem 0.4rem 1rem' },
    followQ: { color: '#7a7060', fontStyle: 'italic', fontSize: '0.88rem', marginBottom: '0.5rem' },
    followA: { background: 'rgba(200,169,126,0.025)', border: '1px solid rgba(200,169,126,0.08)', borderRadius: '10px', padding: isMobile ? '1rem' : '1.2rem 1.4rem', marginBottom: '1.5rem' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => navigate('/dashboard')}><span style={s.navMM}>MM</span>Mystic Madman</div>
        <button style={s.navBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </nav>

      <div style={s.body}>
        <div style={s.header}>
          <h1 style={s.title}>New Session</h1>
          <p style={s.sub}>Share what is alive in you — the more you offer, the deeper the guidance</p>
        </div>

        <div className="sage-tabs">
          {SECTIONS.map(sec => (
            <button key={sec.id} style={s.tab(activeSection === sec.id, sec.color)} onClick={() => setActiveSection(sec.id)}>
              {sec.icon} {sec.label}
              {sectionFilled(sec) && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sec.color }} />}
            </button>
          ))}
        </div>

        {currentSection && (
          <div style={s.panel(currentSection.color)}>
            <div style={s.panelHeader}>
              <span style={{ fontFamily: "'Playfair Display',Georgia,serif", color: currentSection.color, fontSize: '0.95rem' }}>
                {currentSection.icon} {currentSection.label}
              </span>
              <span style={{ fontSize: '0.73rem', color: '#3a3428', fontStyle: 'italic' }}>Fill in what applies — leave the rest blank</span>
            </div>
            {currentSection.fields.map(f => (
              <div key={f.id}>
                <label style={{ ...s.label, color: currentSection.color }}>{f.label}</label>
                <textarea
                  style={s.textarea}
                  value={inputs[currentSection.id][f.id]}
                  onChange={e => setField(currentSection.id, f.id, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        <div style={s.footer}>
          <div style={s.progress}>
            {SECTIONS.map(sec => <div key={sec.id} style={s.pip(sectionFilled(sec), sec.color)} />)}
            <span style={{ fontSize: '0.73rem', color: '#3a3428', marginLeft: '0.35rem' }}>{filledSections.length}/{SECTIONS.length} sections</span>
          </div>
          <button style={s.submitBtn(filledSections.length > 0 && !loading)} onClick={handleSubmit} disabled={filledSections.length === 0 || loading}>
            {loading ? 'Sage is listening...' : 'Seek Guidance →'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '2rem', animation: 'pulse 2s infinite', color: '#c8a97e' }}>⟡</div>
            <p style={{ color: '#5a5248', fontStyle: 'italic', fontSize: '0.9rem', marginTop: '0.8rem' }}>Sage is weaving the threads of your being...</p>
            <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}`}</style>
          </div>
        )}

        {reading && !loading && (
          <div style={s.readingWrap} ref={readingRef}>
            <div style={s.readingHeader}>
              <span style={{ fontFamily: "'Playfair Display',Georgia,serif", color: '#e8d5b0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⟡ Sage's Reading
              </span>
              <button style={s.saveBtn(saved)} onClick={handleSave} disabled={saving || saved}>
                {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Reading'}
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
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#c8bfb0', fontSize: '0.87rem', outline: 'none', fontFamily: "'Lora',Georgia,serif" }}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={!question.trim() || askingFollowUp}
                  style={{ padding: '0.48rem 1.1rem', background: '#c8a97e', border: 'none', borderRadius: '999px', color: '#0d0f0a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 600, opacity: question.trim() ? 1 : 0.4 }}>
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
