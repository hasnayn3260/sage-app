import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Session from './pages/Session'
import Readings from './pages/Readings'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '2rem', animation: 'pulse 2s infinite', color: '#c8a97e' }}>⟡</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
      <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/" />} />
      <Route path="/session" element={session ? <Session session={session} /> : <Navigate to="/" />} />
      <Route path="/readings" element={session ? <Readings session={session} /> : <Navigate to="/" />} />
    </Routes>
  )
}
