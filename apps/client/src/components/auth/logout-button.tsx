import { signOut } from '@/lib/auth-client'
import { SidebarMenuButton } from '@roro-ai/ui/components/ui/sidebar'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const logoutHandler = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/auth/login")
                    }
                }
            })
        } catch (error) {
            console.log("Logout Error", error)
        }
    }
  return (
        <SidebarMenuButton className='bg-destructive hover:bg-destructive/40' onClick={logoutHandler}>
        <LogOut />
        Logout
        </SidebarMenuButton>
  )
}