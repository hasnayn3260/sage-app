import { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Session from './pages/Session'
import Readings from './pages/Readings'

// Brand-consistent loading splash
const MMLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0805' }}>
    <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.4rem', fontWeight: 700, color: '#c8a050', animation: 'pulse 2s infinite', letterSpacing: '0.05em' }}>MM</div>
    <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
  </div>
)

export default function App() {
  const [session, setSession] = useState(undefined)
  // hasConfig: null = not yet checked, true = record exists, false = no record
  const [hasConfig, setHasConfig] = useState(null)

  // Session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[App] initial session:', session?.user?.id || '(none)')
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[App] auth state change:', event, session?.user?.id || '(none)')
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Re-query user_configuration when the logged-in user changes.
  // Exposed as refreshConfig so Onboarding can call it after saving.
  const refreshConfig = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('[App] refreshConfig: no session, resetting hasConfig=false')
      setHasConfig(false)
      return
    }
    console.log('[App] refreshConfig: querying user_configuration for', session.user.id)
    const { data, error } = await supabase
      .from('user_configuration')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
    console.log('[App] refreshConfig: result', { data, error })
    if (error) {
      console.error('[App] refreshConfig: query error — defaulting hasConfig=true to avoid onboarding loop', error)
      setHasConfig(true)
      return
    }
    setHasConfig(!!data)
  }, [session])

  useEffect(() => {
    if (session === undefined) return
    if (!session) {
      setHasConfig(false)
      return
    }
    refreshConfig()
  }, [session, refreshConfig])

  // Waiting for session restore
  if (session === undefined) return <MMLoader />

  // Root route decision
  const rootElement = !session
    ? <Landing />
    : hasConfig === null
      ? <MMLoader />
      : hasConfig
        ? <Navigate to="/dashboard" replace />
        : <Navigate to="/onboarding" replace />

  console.log('[App] routing: session=', !!session, 'hasConfig=', hasConfig)

  return (
    <Routes>
      <Route path="/" element={rootElement} />
      <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/onboarding" element={session ? <Onboarding session={session} onConfigSaved={refreshConfig} /> : <Navigate to="/" />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
      <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/" />} />
      <Route path="/session" element={session ? <Session session={session} /> : <Navigate to="/" />} />
      <Route path="/readings" element={session ? <Readings session={session} /> : <Navigate to="/" />} />
    </Routes>
  )
}
