import React, { useEffect, useState } from 'react'
import { useAuth } from '~/react/hooks/authContext'
import { useStore } from '@nanostores/react'
import { currentPath } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth'

const DebugAuth = () => {
  const { isAuthenticated, loading, user, signOut, refreshSession } = useAuth();
  const current = useStore(currentPath);
  const userHelper = new UserHelper();
  const [redisStatus, setRedisStatus] = useState<{
    success?: boolean;
    message?: string;
    data?: any;
  }>({});

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

  // Costante per il prefisso della sessione

  // Funzioni per testare Redis con il prefisso corretto
  const testRedisSet = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" });
      return;
    }
    
    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
      // Usa il formato corretto della chiave con il prefisso
      
      // Crea l'oggetto sessione nel formato corretto
      const sessionData = {
        session: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || 'User',
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: user.lastLogin?.toISOString() || new Date().toISOString(),
          isAuthenticated: true,
          provider: user.provider || 'email',
          tokens: {
            accessToken: user.tokens?.accessToken || 'test-token',
            refreshToken: user.tokens?.refreshToken || 'test-refresh',
            expiresAt: user.tokens?.expiresAt || Date.now() + 3600000 // in millisecondi
          },
          metadata: {
            provider: user.metadata?.provider || 'email',
            avatarUrl: user.metadata?.avatarUrl,
            githubUsername: user.metadata?.githubUsername
          }
        },
        expirySeconds: 3600 // 1 ora di scadenza
      };
      
      const response = await fetch(`${redisApiUrl}/set-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      const data = await response.json();
      console.log('Redis SET response:', data);
      setRedisStatus({ success: response.ok, message: "Session saved to Redis", data });
    } catch (error) {
      console.error('Redis SET error:', error);
      setRedisStatus({ success: false, message: String(error) });
    }
  };

  const testRedisGet = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" });
      return;
    }
    
    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
      // Usa il formato corretto della chiave con il prefisso
      
      const response = await fetch(`${redisApiUrl}/session/${user.id}`);
      
      const data = await response.json();
      console.log('Redis GET response:', data);
      setRedisStatus({ 
        success: response.ok, 
        message: response.ok ? "Session retrieved from Redis" : "No session found", 
        data 
      });
    } catch (error) {
      console.error('Redis GET error:', error);
      setRedisStatus({ success: false, message: String(error) });
    }
  };

  const testRedisDelete = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" });
      return;
    }
    
    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
      // Usa il formato corretto della chiave con il prefisso
      
      const response = await fetch(`${redisApiUrl}/delete/${user.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      console.log('Redis DELETE response:', data);
      setRedisStatus({ success: response.ok, message: "Session deleted from Redis", data });
    } catch (error) {
      console.error('Redis DELETE error:', error);
      setRedisStatus({ success: false, message: String(error) });
    }
  };

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
    <div>
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
        
        {/* Redis Debug Section */}
        <div className="mt-4 border-t border-gray-600 pt-2">
          <h3 className="font-bold mb-2">Redis Debug</h3>
          <div className="flex space-x-2 mb-2">
            <button
              className="px-2 py-1 bg-blue-500 rounded text-xs"
              onClick={testRedisGet}
            >
              Get Redis
            </button>
            <button
              className="px-2 py-1 bg-green-500 rounded text-xs"
              onClick={testRedisSet}
            >
              Set Redis
            </button>
            <button
              className="px-2 py-1 bg-red-500 rounded text-xs"
              onClick={testRedisDelete}
            >
              Delete Redis
            </button>
          </div>
          
          {redisStatus.message && (
            <div className={`text-xs p-1 rounded ${redisStatus.success ? 'bg-green-800' : 'bg-red-800'}`}>
              {redisStatus.message}
            </div>
          )}
          
          {redisStatus.data && (
            <div className="mt-1 max-h-24 overflow-auto text-xs break-words">
              <pre className="whitespace-pre-wrap">{JSON.stringify(redisStatus.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Barra di stato dell'autenticazione */}
      <div className={`p-2 text-white text-sm ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
        Auth Status: {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        {isAuthenticated && user && (
          <span className="ml-2">User: {user.email || user.id}</span>
        )}
      </div>
    </div>
  );
};

export default DebugAuth;
