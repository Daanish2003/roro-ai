import { signOut } from '@/lib/auth-client'
import { Button } from '@roro-ai/ui/components/ui/button'
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
    <Button
      variant={"destructive"}
      type='submit'
      onClick={() => logoutHandler()}
    >
        Logout
        <LogOut />
    </Button>
  )
}