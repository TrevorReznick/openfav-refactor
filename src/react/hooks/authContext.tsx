import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { userStore } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth'
import type { UserSession } from '~/types/auth/userSession'
import { handleSignOut } from '@/react/hooks/useAuthActions'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a properly typed provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  const userHelper = new UserHelper()

  const refreshSession = async () => {
    try {
      setLoading(true)
      const session = await userHelper.getCompleteSession()
      setUser(session)
      setIsAuthenticated(session.isAuthenticated)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await handleSignOut()
    setUser(null)
    setIsAuthenticated(false)
  }

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
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}