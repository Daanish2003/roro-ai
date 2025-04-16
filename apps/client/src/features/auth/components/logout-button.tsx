"use client"
import { signOut } from '@/features/auth/auth-client'
import { Button } from '@roro-ai/ui/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const logoutHandler = async () => {
        try {
            await signOut()
            router.push('/auth/login')
        } catch (error) {
            console.log("Logout Error", error)
        }
    }
  return (
        <Button onClick={logoutHandler} className='bg-transparent text-white text-sm font-normal px-2 m-0 w-full content-start hover:bg-secondary/90 justify-start gap-2'>
        <LogOut />
            Logout
        </Button>
  )
}