import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const logoutHandler = async () => {
        console.log("logout")
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
    <button
      type='submit'
      onClick={() => logoutHandler()}
    >
        Logout
    </button>
  )
}
