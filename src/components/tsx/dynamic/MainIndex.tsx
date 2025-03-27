import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from '@/providers/supabaseAuth'
import Navbar from '@/components/tsx/common/Navbar'
import Dashboard from '@/components/tsx/main/Dashboard'

const Index = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div> // O un componente di caricamento più elaborato
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Aggiungi altre rotte se necessario */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Esempio di rotta per l'autenticazione */}
          <Route path="/auth" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default Index
