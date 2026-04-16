import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import AppShell from '../components/AppShell'
import { SearchIcon, TrashIcon, ArrowLeftIcon } from '../components/Icons'

const C = {
  bg: '#141008', surface: '#1c1610', elevated: '#231e14',
  border: 'rgba(255,255,255,0.06)', borderMed: 'rgba(255,255,255,0.1)',
  borderGold: 'rgba(200,160,80,0.25)',
  gold: '#c8a050', goldMuted: '#9a7830', goldFaint: 'rgba(200,160,80,0.08)',
  text: '#f0e6c8', textSec: '#a09070', textMuted: '#5a5040', textDim: '#3a3020',
  danger: '#c07060',
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

export default function Readings({ session }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    supabase.from('sessions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setSessions(data || []); setLoading(false) })
  }, [session])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(p => p.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const filtered = sessions.filter(s => !search || (s.title || '').toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <AppShell session={session} pageName="Past Sessions">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.4rem', fontWeight: 700, color: C.gold, animation: 'pulse 2s infinite' }}>MM</div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
      </div>
    </AppShell>
  )

  // ── Mobile: selected session full screen ─────────
  if (isMobile && selected) {
    return (
      <AppShell session={session} pageName="Past Sessions">
        <button onClick={() => setSelected(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: C.textSec, fontFamily: "'Lora',Georgia,serif", fontSize: '0.82rem', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
          <ArrowLeftIcon size={14} color={C.textSec} /> All Sessions
        </button>
        <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.4rem', fontWeight: 600, color: C.text, marginBottom: '0.3rem' }}>{selected.title || 'Holistic Session'}</h2>
        <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.textMuted, marginBottom: '1.5rem' }}>{formatDate(selected.created_at)} at {formatTime(selected.created_at)}</p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '1.2rem' }}>
          <MarkdownRenderer text={selected.reading} />
        </div>
        <button onClick={() => handleDelete(selected.id)} disabled={deleting}
          style={{ margin: '1.5rem auto 0', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: `1px solid rgba(192,112,96,0.25)`, borderRadius: 999, padding: '0.5rem 1.1rem', color: C.danger, fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', cursor: 'pointer' }}>
          <TrashIcon size={13} color={C.danger} /> Delete session
        </button>
      </AppShell>
    )
  }

  return (
    <AppShell session={session} pageName="Past Sessions">
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.5rem', fontWeight: 700, color: C.gold, marginBottom: '0.8rem', letterSpacing: '0.05em' }}>MM</div>
          <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.92rem', color: C.textSec, fontStyle: 'italic', marginBottom: '1.5rem' }}>Your journey begins with a single session</p>
          <button onClick={() => navigate('/session')} style={{ padding: '0.7rem 1.8rem', background: `linear-gradient(135deg,${C.gold},${C.goldMuted})`, border: 'none', borderRadius: 999, color: '#0f0c08', fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Begin your first session →</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left panel: list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.15rem', fontWeight: 600, color: C.text }}>Your Sessions</h2>
              <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.72rem', color: C.textMuted }}>{sessions.length}</span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <SearchIcon size={14} color={C.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search sessions..."
                style={{
                  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '0.55rem 0.8rem 0.55rem 2rem', color: C.text,
                  fontSize: '0.82rem', fontFamily: "'Lora',Georgia,serif", outline: 'none', boxSizing: 'border-box',
                }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {filtered.map(sess => {
                const active = selected?.id === sess.id
                return (
                  <div key={sess.id} onClick={() => setSelected(sess)}
                    style={{
                      background: active ? C.elevated : C.surface,
                      border: `1px solid ${active ? C.borderGold : C.border}`,
                      borderLeft: active ? `3px solid ${C.gold}` : `3px solid transparent`,
                      borderRadius: 10, padding: '0.8rem 1rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.borderMed }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border }}>
                    <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', color: C.text, marginBottom: '0.2rem' }}>{sess.title || 'Holistic Session'}</div>
                    <div style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.7rem', color: C.textMuted }}>{formatDate(sess.created_at)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right panel: reading or placeholder */}
          {selected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.5rem', fontWeight: 600, color: C.text }}>{selected.title || 'Holistic Session'}</h2>
              </div>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.75rem', color: C.textMuted, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>{formatDate(selected.created_at)} at {formatTime(selected.created_at)}</p>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 'clamp(1.2rem,3vw,2rem)' }}>
                <MarkdownRenderer text={selected.reading} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={() => handleDelete(selected.id)} disabled={deleting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: `1px solid rgba(192,112,96,0.25)`, borderRadius: 999, padding: '0.5rem 1.1rem', color: C.danger, fontFamily: "'Lora',Georgia,serif", fontSize: '0.78rem', cursor: 'pointer' }}>
                  <TrashIcon size={13} color={C.danger} /> Delete session
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: C.textMuted }}>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.3rem', fontWeight: 700, color: C.goldMuted, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>MM</div>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: '0.85rem', fontStyle: 'italic' }}>Select a session to read it</p>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
