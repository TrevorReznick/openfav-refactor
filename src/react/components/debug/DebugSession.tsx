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
      const sess = await sessionManager.getCompleteSession()
      setSession(sess)
      const auth = sessionManager.isAuthenticated()
      setIsAuthenticated(auth)
      setMessage(`[Auth Status] ${auth ? 'Authenticated' : 'Not authenticated'}`)
      setLoading(false)
      if (sess) {
        console.log('[ThisPage] Session loaded successfully')
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
      setMessage('Loading session...')
      console.log('🔍 [DebugSession] Loading session...')
      
      const sessionData = await sessionManager.getCompleteSession()
      console.log('🔍 [DebugSession] Raw session data:', sessionData)
      
      if (!sessionData) {
        setMessage('[ThisPage] No active session found')
        setSession(null)
        return;
      }
      
      setSession(sessionData);
      setLastUpdated(new Date())
      setMessage('[ThisPage] Session loaded successfully')
      console.log('🔍 [DebugSession] Session state updated:', sessionData)
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
      const created = await sessionManager.createSession();
      setMessage(created ? 'Session created' : 'Failed to create session');
      console.log('🔍 [DebugSession] Session created:', created);
      if (created) await loadSession();
    } catch (error) {
      console.error('Error creating session:', error);
      setMessage('Error creating session');
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
            console.log('DEBUG Storage:', { userId, storeData });
            alert(`LocalStorage: ${userId}\nStore: ${JSON.stringify(storeData)}`);
          }}
          style={{ marginTop: '10px' }}
        >
          Debug Storage State
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