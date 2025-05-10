import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { userStore } from '@/store'
import { UserHelper } from '~/scripts/getAuth' // Assicurati che il percorso sia corretto
import type { UserSession } from '~/types/auth/userSession'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  const userHelper = UserHelper.getInstance();

  const refreshSession = async () => {
    try {
      setLoading(true);
      const session = await userHelper.getCompleteSession();
      setUser(session);
      setIsAuthenticated(session.isAuthenticated);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Inizializza l'autenticazione
    const initialize = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        await refreshSession();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Sottoscrizione ai cambiamenti dello store
    const unsubscribe = userStore.subscribe((newUserState) => {
      console.log('User store updated:', newUserState);
      setUser(newUserState);
      setIsAuthenticated(!!newUserState?.isAuthenticated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Implementa la logica di logout
      // Potrebbe essere necessario chiamare un'API
      await fetch('/api/v1/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Resetta lo stato locale
      const emptyUser = userHelper.getUserInfo(); // Questo dovrebbe restituire un utente vuoto
      userStore.set(emptyUser);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
