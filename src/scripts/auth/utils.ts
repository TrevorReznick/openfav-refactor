import { userStore } from '@/store'
import { toast } from 'sonner'

export const handleSignOut = async () => {

    if (typeof window === 'undefined') return false

    userStore.set({
        id: '',
        email: '',
        user_metadata: {},
        app_metadata: {},
        created_at: '',
        last_sign_in_at: new Date().toISOString(),
        exp: 0
    })

    window.localStorage.removeItem('openfav-userId')

    window.location.href = '/api/v1/auth/signout'



    toast.success('Logged out successfully')



}