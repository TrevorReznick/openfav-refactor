import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { userStore } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth' // Assicurati che il percorso sia corretto
import type { UserSession } from '~/types/auth/userSession'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Track AuthProvider instances
const authProviderInstances = new Set<string>();

// Create a properly typed provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Generate a unique ID for this instance
  const instanceId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  console.log(`🔐 AuthProvider [${instanceId}] mounted`);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track this instance
  React.useEffect(() => {
    authProviderInstances.add(instanceId);
    console.log(`🔐 Active AuthProvider instances: ${authProviderInstances.size}`, 
                Array.from(authProviderInstances));
    
    return () => {
      authProviderInstances.delete(instanceId);
      console.log(`🔐 AuthProvider [${instanceId}] unmounted`);
      console.log(`🔐 Remaining AuthProvider instances: ${authProviderInstances.size}`);
    };
  }, [instanceId]);
  
  const userHelper = new UserHelper();

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
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.warn('useAuth must be used within an AuthProvider');
    // Return a default context instead of throwing to prevent app crashes
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      signOut: async () => {},
      refreshSession: async () => {}
    };
  }
  return context;
};
