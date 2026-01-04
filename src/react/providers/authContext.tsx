import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { sessionManager } from '~/scripts/auth/sessionManager'
import { userStore } from '@/store'
import type { UserSession } from '~/types/auth/userSession'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a properly typed provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = async () => {
    try {
      setLoading(true)
      const session = await sessionManager.getCompleteSession()
      if (session) {
        setUser(session)
        setIsAuthenticated(true)
        userStore.set(session) // Aggiorna lo store con i dati della sessione
      } else {
        setUser(null)
        setIsAuthenticated(false)
        userStore.set(null)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      setUser(null)
      setIsAuthenticated(false)
      userStore.set(null)
    } finally {
      setLoading(false)
    }
  }

  // La gestione del logout è ora centralizzata in src/scripts/auth/logout.ts
  // Utilizza direttamente la funzione `logout` esportata da quel modulo

  useEffect(() => {
    refreshSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}