import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function MarkdownRenderer({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.1rem', color: '#c8a97e', marginTop: '1.8rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(200,169,126,0.15)', paddingBottom: '0.3rem', fontWeight: 600 }}>{line.replace('## ', '')}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.95rem', color: '#e8d5b0', marginTop: '0.9rem', marginBottom: '0.3rem' }}>{line.replace('### ', '')}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.35rem', paddingLeft: '0.3rem' }}><span style={{ color: '#c8a97e', flexShrink: 0, marginTop: '3px' }}>◆</span><span style={{ color: '#d4c5a9', lineHeight: 1.75 }}>{line.replace(/^[-•] /, '')}</span></div>
        if (line.match(/^\d+\. /)) { const num = line.match(/^(\d+)\./)[1]; return <div key={i} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.4rem' }}><span style={{ color: '#c8a97e', fontWeight: 700, flexShrink: 0 }}>{num}.</span><span style={{ color: '#d4c5a9', lineHeight: 1.75 }}>{line.replace(/^\d+\. /, '')}</span></div> }
        if (line.trim() === '') return <div key={i} style={{ height: '0.35rem' }} />
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return <p key={i} style={{ color: '#b8b0a0', lineHeight: 1.8, marginBottom: '0.25rem' }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#e0d0b8' }}>{p}</strong> : p)}</p>
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [session])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0d0f0a 0%, #111409 40%, #0a0d12 100%)' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.85rem 1rem' : '1.2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    navLogo: { fontFamily: "'Cormorant Garamond',Georgia,serif", color: '#c8a97e', fontSize: isMobile ? '0.95rem' : '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', letterSpacing: '0.02em' },
    navMM: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(200,169,126,0.1)', border: '1px solid rgba(200,169,126,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#c8a97e', flexShrink: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: 0 },
    navBtn: { padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', color: '#5a5248', fontSize: isMobile ? '0.72rem' : '0.78rem', cursor: 'pointer' },
    body: { maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '1.5rem 1rem 3rem' : '3rem 1.5rem 5rem' },
    header: { marginBottom: isMobile ? '1.5rem' : '2.5rem' },
    title: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: '#e8d5b0', marginBottom: '0.3rem' },
    sub: { color: '#5a5248', fontSize: '0.85rem' },
    layout: { display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' },
    list: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
    card: (active) => ({ background: active ? 'rgba(200,169,126,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? 'rgba(200,169,126,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', padding: '1.1rem 1.3rem', cursor: 'pointer', transition: 'all 0.2s' }),
    cardTitle: { color: '#c8bfb0', fontSize: '0.88rem', marginBottom: '0.25rem', fontFamily: "'Lora',Georgia,serif" },
    cardDate: { color: '#3a3428', fontSize: '0.73rem' },
    cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' },
    deleteBtn: { padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid rgba(212,100,100,0.2)', borderRadius: '4px', color: '#6a3030', fontSize: '0.7rem', cursor: 'pointer' },
    reading: { background: 'rgba(200,169,126,0.025)', border: '1px solid rgba(200,169,126,0.1)', borderRadius: '14px', padding: isMobile ? '1.2rem 1rem' : '2rem' },
    readingTitle: { fontFamily: "'Playfair Display',Georgia,serif", color: '#e8d5b0', fontSize: '1.1rem', marginBottom: '0.3rem' },
    readingDate: { color: '#5a5248', fontSize: '0.78rem', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0', background: 'transparent', border: 'none', color: '#5a5248', fontSize: '0.82rem', cursor: 'pointer', marginBottom: '1rem', fontFamily: "'Lora',Georgia,serif" },
    empty: { textAlign: 'center', padding: isMobile ? '3rem 1.5rem' : '4rem 2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' },
    emptyTitle: { fontFamily: "'Playfair Display',Georgia,serif", color: '#3a3428', fontSize: '1.1rem', marginBottom: '0.5rem' },
    emptyText: { color: '#2a2418', fontSize: '0.85rem', marginBottom: '1.5rem' },
    newBtn: { padding: '0.65rem 1.6rem', background: 'linear-gradient(135deg,#c8a97e,#a0845e)', border: 'none', borderRadius: '999px', color: '#0d0f0a', fontFamily: "'Playfair Display',Georgia,serif", fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' },
    placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#3a3428', fontStyle: 'italic', fontSize: '0.85rem' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '2rem', animation: 'pulse 2s infinite', color: '#c8a97e' }}>⟡</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => navigate('/dashboard')}><span style={s.navMM}>MM</span>Mystic Madman</div>
        <div style={{ display: 'flex', gap: isMobile ? '0.4rem' : '0.7rem' }}>
          <button style={s.navBtn} onClick={() => navigate('/session')}>{isMobile ? '+ New' : 'New Session'}</button>
          <button style={s.navBtn} onClick={() => navigate('/dashboard')}>{isMobile ? '← Home' : '← Dashboard'}</button>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.header}>
          <h1 style={s.title}>Past Sessions</h1>
          <p style={s.sub}>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} saved</p>
        </div>

        {sessions.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyTitle}>No sessions yet</p>
            <p style={s.emptyText}>Begin your first session and save it to see it here</p>
            <button style={s.newBtn} onClick={() => navigate('/session')}>Begin First Session →</button>
          </div>
        ) : isMobile ? (
          selected ? (
            <div>
              <button style={s.backBtn} onClick={() => setSelected(null)}>← All Sessions</button>
              <div style={s.reading}>
                <div style={s.readingTitle}>{selected.title || 'Holistic Session'}</div>
                <div style={s.readingDate}>{formatDate(selected.created_at)} at {formatTime(selected.created_at)}</div>
                <MarkdownRenderer text={selected.reading} />
              </div>
            </div>
          ) : (
            <div style={s.list}>
              {sessions.map(sess => (
                <div key={sess.id} style={s.card(false)} onClick={() => setSelected(sess)}>
                  <div style={s.cardTitle}>{sess.title || 'Holistic Session'}</div>
                  <div style={s.cardDate}>{formatDate(sess.created_at)}</div>
                  <div style={s.cardFooter}>
                    <span style={{ fontSize: '0.7rem', color: '#3a3428' }}>{formatTime(sess.created_at)}</span>
                    <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); handleDelete(sess.id) }} disabled={deleting}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={s.layout}>
            <div style={s.list}>
              {sessions.map(sess => (
                <div key={sess.id} style={s.card(selected?.id === sess.id)} onClick={() => setSelected(sess)}
                  onMouseEnter={e => { if (selected?.id !== sess.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { if (selected?.id !== sess.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <div style={s.cardTitle}>{sess.title || 'Holistic Session'}</div>
                  <div style={s.cardDate}>{formatDate(sess.created_at)}</div>
                  <div style={s.cardFooter}>
                    <span style={{ fontSize: '0.7rem', color: '#3a3428' }}>{formatTime(sess.created_at)}</span>
                    <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); handleDelete(sess.id) }} disabled={deleting}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {selected ? (
              <div style={s.reading}>
                <div style={s.readingTitle}>{selected.title || 'Holistic Session'}</div>
                <div style={s.readingDate}>{formatDate(selected.created_at)} at {formatTime(selected.created_at)}</div>
                <MarkdownRenderer text={selected.reading} />
              </div>
            ) : (
              <div style={s.placeholder}>Select a session to view it</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
