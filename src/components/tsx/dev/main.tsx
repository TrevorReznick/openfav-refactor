import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '~/scripts/authContext'
import { useStore } from '@nanostores/react'
import { currentPath } from '@/store'
import { UserHelper } from '~/scripts/getAuth' 

import Dashboard from '@/components/tsx/main/Dashboard'
import AuthPage from '@/components/tsx/auth/Auth'

const MainIndex = () => {
  const { isAuthenticated, loading, user, signOut, refreshSession } = useAuth();
  const current = useStore(currentPath);
  const userHelper = UserHelper.getInstance();

  // Debug: Verifica manuale della sessione
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Manual auth check:');
      
      try {
        // Verifica se l'utente è autenticato secondo UserHelper
        const isAuth = userHelper.isAuthenticated();
        console.log('- UserHelper.isAuthenticated():', isAuth);
        
        // Verifica se il token è scaduto
        const isExpired = userHelper.isTokenExpired();
        console.log('- Token expired:', isExpired);
        
        // Ottieni info utente dallo store
        const userInfo = userHelper.getUserInfo();
        console.log('- User info from store:', userInfo);
        
        // Verifica i cookie
        console.log('- Cookies available:', document.cookie ? 'yes' : 'no');
      } catch (e) {
        console.error('Error checking auth:', e);
      }
    };
    
    checkAuth();
  }, []);

  // Debug: Aggiungiamo log per verificare lo stato di autenticazione
  useEffect(() => {
    console.log('🔐 Auth Debug:');
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- loading:', loading);
    console.log('- user:', user);
    console.log('- current path:', current);
  }, [isAuthenticated, loading, user, current]);

  // Mostra un indicatore di caricamento durante l'inizializzazione dell'autenticazione
  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800">
        <h2 className="text-lg font-bold">Loading Authentication...</h2>
        <p>Checking if user is authenticated...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Debug panel */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded shadow-lg z-50 text-sm">
        <h3 className="font-bold text-lg mb-2">Auth Debug</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>Status:</div>
          <div className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {loading ? "Loading..." : isAuthenticated ? "Authenticated ✅" : "Not Authenticated ❌"}
          </div>
          
          <div>User:</div>
          <div>{user ? (user.email || JSON.stringify(user).substring(0, 20) + "...") : "null"}</div>
          
          <div>Path:</div>
          <div>{current || window.location.pathname}</div>
          
          <div>Token:</div>
          <div>{user?.tokens?.accessToken ? "Present" : "None"}</div>
          
          <div>Expires:</div>
          <div>
            {user?.tokens?.expiresAt 
              ? new Date(user.tokens.expiresAt * 1000).toLocaleTimeString() 
              : "N/A"}
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button 
            className="px-2 py-1 bg-blue-600 rounded text-xs"
            onClick={async () => {
              const session = await userHelper.getSessionTokens();
              console.log('Session check:', session);
              alert(session ? `Session exists: ${session.email}` : 'No session found');
            }}
          >
            Check Session
          </button>
          
          <button 
            className="px-2 py-1 bg-green-600 rounded text-xs"
            onClick={() => {
              window.location.href = '/api/v1/auth/signin';
            }}
          >
            Sign In
          </button>
          
          <button 
            className="px-2 py-1 bg-purple-600 rounded text-xs"
            onClick={async () => {
              await refreshSession();
            }}
          >
            Refresh
          </button>
          
          <button 
            className="px-2 py-1 bg-red-600 rounded text-xs"
            onClick={async () => {
              await signOut();
              window.location.reload();
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Barra di stato dell'autenticazione */}
      <div className={`p-2 text-white text-sm ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
        Auth Status: {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        {isAuthenticated && user && (
          <span className="ml-2">
            User: {user.email || user.id}
          </span>
        )}
      </div>

      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
          
          {/* Aggiungi questa route per gestire /test/main */}
          <Route path="/test/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          
          {/* Route catch-all per gestire tutti i percorsi non definiti */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default MainIndex;
