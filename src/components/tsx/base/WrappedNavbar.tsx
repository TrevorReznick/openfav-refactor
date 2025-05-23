import { useEffect, useState } from 'react'
import { supabase } from '@/providers/supabaseAuth'
import Navbar from '@/components/tsx/common/Navbar'
import { NavigationProvider } from '~/hooks/NavigationContext'

const WrNavbar = () => {
  

  return (    
    <NavigationProvider>      
      <Navbar />     
    </NavigationProvider>
    
  )
}

export default WrNavbar
