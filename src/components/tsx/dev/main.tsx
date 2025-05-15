import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '~/scripts/authContext'
import Dashboard from '@/components/tsx/main/Dashboard'
import AuthPage from '@/components/tsx/auth/Auth'

const MainIndex = () => {
  const { isAuthenticated, loading } = useAuth();

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
