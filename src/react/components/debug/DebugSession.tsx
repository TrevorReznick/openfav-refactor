import { useState, useEffect } from 'react'
import { sessionManager } from '~/scripts/auth/sessionManager'
import { userStore } from '@/store'
import type { UserSession } from '~/types/users'

export const SessionManagerTest = () => {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    const loadSession = async () => {
      setLoading(true)
      try {
        const sess = await sessionManager.getCompleteSession()
        const auth = sessionManager.isAuthenticated()
        
        setSession(sess)
        setIsAuthenticated(auth)
        
        if (auth && sess) {
          const msg = '[ThisPage] Session loaded successfully - User is authenticated'
          setMessage(msg)
          console.log(msg)
        } else {
          const msg = '[ThisPage] User is not authenticated'
          setMessage(msg)
          console.log(msg)
        }
      } catch (error) {
        const errorMsg = `[ThisPage] Error loading session: ${error instanceof Error ? error.message : 'Unknown error'}`
        setMessage(errorMsg)
        console.error(errorMsg, error)
      } finally {
        setLoading(false)
      }
    }
    loadSession()
    /*
    const checkAuth = async () => {
      try {
        setLoading(true);
        const authStatus = await sessionManager.isAuthenticated();
        setIsAuthenticated(authStatus);
        setMessage(`[Auth Status] ${authStatus ? 'Authenticated' : 'Not authenticated'}`);
        console.log('🔐 [DebugSession] Authentication status:', authStatus);
        
        if (authStatus) {
          await loadSession();
        }
      } catch (error) {
        console.error('❌ [DebugSession] Error checking authentication:', error);
        setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    */
  }, []);

  const loadSession = async () => {
    try {
      setLoading(true)
      const loadingMsg = 'Loading session...'
      setMessage(loadingMsg)
      console.log('🔍 [DebugSession]', loadingMsg)
      
      const sessionData = await sessionManager.getCompleteSession()
      const auth = sessionManager.isAuthenticated()
      
      console.log('🔍 [DebugSession] Raw session data:', sessionData)
      
      if (!sessionData || !auth) {
        const msg = '[ThisPage] No active session - User is not authenticated'
        setMessage(msg)
        setSession(null)
        console.log(msg)
        return;
      }
      
      setSession(sessionData);
      setLastUpdated(new Date())
      const successMsg = '[ThisPage] Session loaded successfully'
      setMessage(successMsg)
      console.log('🔍 [DebugSession]', successMsg, sessionData)
    } catch (error) {
      console.error('❌ [DebugSession] Error loading session:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSession(null)
    } finally {
      setLoading(false)
    }
  };

  const handleInvalidate = async () => {
    try {
      setLoading(true);
      await sessionManager.invalidateSession();
      setSession(null);
      setIsAuthenticated(false);
      setMessage('Session invalidated');
      console.log('🔍 [DebugSession] Session invalidated');
    } catch (error) {
      console.error('Error invalidating session:', error);
      setMessage('Error invalidating session');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setMessage('Creating test session...');
      
      // Get current user data or use test data
      const currentUser = await sessionManager.getCompleteSession() || {
        id: `test-user-${Date.now()}`,
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: new Date(),
        lastLogin: new Date(),
        isAuthenticated: true,
        provider: 'test',
        tokens: {
          accessToken: `test-access-${Date.now()}`,
          refreshToken: `test-refresh-${Date.now()}`,
          expiresAt: Date.now() + 3600000 // 1 hour from now
        },
        metadata: {
          provider: 'test',
          avatarUrl: null,
          githubUsername: null
        }
      };

      const sessionData = {
        session: {
          id: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName || 'Test User',
          createdAt: currentUser.createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: currentUser.lastLogin?.toISOString() || new Date().toISOString(),
          isAuthenticated: true,
          provider: currentUser.provider || 'test',
          tokens: {
            accessToken: currentUser.tokens?.accessToken || `test-access-${Date.now()}`,
            refreshToken: currentUser.tokens?.refreshToken || `test-refresh-${Date.now()}`,
            expiresAt: currentUser.tokens?.expiresAt || Date.now() + 3600000
          },
          metadata: {
            provider: currentUser.metadata?.provider || 'test',
            avatarUrl: currentUser.metadata?.avatarUrl,
            githubUsername: currentUser.metadata?.githubUsername
          }
        },
        expirySeconds: 3600
      };

      console.log('🔍 [DebugSession] Creating session with data:', sessionData);
      
      // Try to save to Redis if API URL is available
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
      if (redisApiUrl) {
        try {
          const response = await fetch(`${redisApiUrl}/set-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
          });
          
          const data = await response.json();
          console.log('🔍 [DebugSession] Redis SET response:', data);
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to save session to Redis');
          }
          
          setMessage('✅ Session created and saved to Redis');
        } catch (redisError) {
          console.error('❌ [DebugSession] Redis error:', redisError);
          setMessage('⚠️ Session created but failed to save to Redis');
        }
      } else {
        // Fallback to local session creation if Redis is not available
        const created = await sessionManager.createSession();
        console.log('🔍 [DebugSession] Local session created:', created);
        setMessage(created ? '✅ Session created (local)' : '❌ Failed to create local session');
      }
      
      // Reload the session to reflect changes
      await loadSession();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [DebugSession] Error creating session:', error);
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Session Manager Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={loadSession} 
          disabled={loading}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Load Session'}
        </button>
        <button 
          onClick={handleCreate} 
          disabled={loading}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
        <button 
          onClick={handleInvalidate} 
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f44336', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Invalidate Session'}
        </button>
        <button 
          onClick={() => {
            const userId = localStorage.getItem('openfav-userId');
            const storeData = userStore.get();
            const allStorage = { ...localStorage };
            
            console.log('[DebugSession] Storage State:', { 
              openfavUserId: userId,
              localStorage: allStorage,
              userStore: storeData 
            });
            
            const storageInfo = Object.entries(localStorage)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n\n');
              
            alert(`=== LocalStorage Debug ===
            
🔑 openfav-userId: ${userId || 'not found'}

📦 All LocalStorage Items:
${storageInfo}

🛒 User Store:
${JSON.stringify(storeData, null, 2)}`);
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span>🔍</span>
          Debug LocalStorage
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          borderLeft: `4px solid ${message.includes('Error') ? '#f44336' : '#4caf50'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Session Data:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          maxHeight: '400px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
};