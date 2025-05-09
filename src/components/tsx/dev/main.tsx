/*
import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/providers/supabaseAuth'
import { toast } from 'sonner'
import { Button } from '@/components/tsx/ui/button'
import { useNavigation } from '~/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { setupAuth } from '~/scripts/authUtils'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useStore(userStore)
  const { navigate } = useNavigation()
  const current = useStore(currentPath)

  useEffect(() => {
    const initializeAuth = async () => {
      await setupAuth()
    }
    initializeAuth()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      //navigate('/api/v1/auth/signout')
      window.location.href = '/api/v1/auth/signout'
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
      console.error(error)
    }
  }

  const goToPage = () =>{
    window.location.href = '/api/v1/auth/signout'
  }


*/
import { useEffect, useState } from 'react'
import { useNavigation } from '~/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { setupAuth } from '~/scripts/authUtils'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from '@/providers/supabaseAuth'

import Dashboard from '@/components/tsx/main/Dashboard'
import AuthPage from '@/components/tsx/auth/Auth'

const MainIndex = () => {
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