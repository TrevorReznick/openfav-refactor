import { useEffect, useState } from 'react'
import { supabase } from '@/providers/supabaseAuth'
import { NavigationProvider } from '~/hooks/NavigationContext'
import type { ComponentType } from 'react'

interface WrapperProps {
  component: string // Nome del componente come stringa
    props?: any // Props opzionali da passare al componente
    src: string
}
console.log('GenericComp initialized');

const GenericComp: React.FC<WrapperProps> = ({ component, props, src }) => {
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    // Importa dinamicamente il componente basato sul nome
    const loadComponent = async () => {
      try {
        const module = await import(/* @vite-ignore */ `@/components/tsx/${src}/${component}`)
        console.log(`Componente ${component} caricato con successo da ${src}`);
        setComponent(() => module.default);
      } catch (error) {
        console.error(`Errore nel caricamento del componente ${component}:`, error);
      }
    };

    loadComponent()
  }, [component])

  if (!Component) {
    return null // O un componente di loading
  }

  return (    
    <NavigationProvider>      
      <Component {...props} />     
    </NavigationProvider>
  )
}

export default GenericComp