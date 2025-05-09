// File: src/components/Notifications.jsx
import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { messageStore } from "~/store";

export default function ({errorMessage}) {
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage)
            /*
            const promise = () => new Promise((resolve, reject) => setTimeout(() => reject({ name: 'Sonner' }), 2000))
            toast.promise(promise, {
                loading: 'Loading...',
                success: (data) => {
                    return `${errorMessage} toast has been added`
                },
                error: 'Error',
            })
            */
            messageStore.set('')
        }
        
    }, [errorMessage])
    
    return ( 
        <>
            <Toaster position="top-center" />
        </> 
    ) 
}