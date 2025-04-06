// NavigationContext.tsx
import React, { createContext, useContext } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'

interface NavigationContextType {
  navigate: (path: string) => void
  goBack: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const current = useStore(currentPath);
  const previous = useStore(previousPath);

  const navigate = (path: string) => {
    previousPath.set(current); // Salva il percorso attuale come precedente
    currentPath.set(path); // Imposta il nuovo percorso
    window.history.pushState({}, '', path); // Aggiorna l'URL senza ricaricare la pagina
  };

  const goBack = () => {
    currentPath.set(previous); // Torna al percorso precedente
    window.history.back(); // Torna indietro nella cronologia del browser
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}