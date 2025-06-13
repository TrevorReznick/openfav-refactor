'use client'

// TODO: Replace with the correct import path for useLoading
import { useLoading } from '@/store'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function GlobalLoader() {
  const { isLoading, message } = useLoading()
  const [show, setShow] = useState(false)

  // Aggiungi un piccolo ritardo per evitare il lampeggio del loader per caricamenti molto veloci
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (isLoading) {
      timeout = setTimeout(() => setShow(true), 100)
    } else {
      setShow(false)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isLoading])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
