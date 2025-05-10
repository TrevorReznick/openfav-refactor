import { useEffect, useState } from 'react'
import { useNavigation } from '~/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { setupAuth } from '~/scripts/authUtils'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from '@/providers/supabaseAuth'
import { AuthProvider } from '~/scripts/authContext'

import Dashboard from '@/components/tsx/main/Dashboard'
import AuthPage from '@/components/tsx/auth/Auth'

const MainIndex = () => {
  const [loading, setLoading] = useState(true)
  const { navigate } = useNavigation()
  const user = useStore(userStore)
  const current = useStore(currentPath)

  useEffect(() => {
    const initializeAuth = async () => {
      await setupAuth()
      setLoading(false)
    }
    initializeAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div> // O un componente di caricamento più elaborato
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Aggiungi altre rotte se necessario */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Esempio di rotta per l'autenticazione */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default MainIndex