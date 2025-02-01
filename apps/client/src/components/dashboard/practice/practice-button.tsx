"use client"
import { useSession } from '@/lib/auth-client'
import { Button } from '@roro-ai/ui/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import useShowToast from "@/hooks/use-show-toast"

export default function PracticeButton() {
  const showTaost = useShowToast()
  const { data:session } = useSession()
  const router = useRouter()

  const startPracticeHandler = async () => {
  
    try {
      const response  = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          roomName: `${session?.user.name}'s Room`,
          }),
          credentials: 'include'
        })

      const data = await response.json()

      if(!response.ok) {
          showTaost({
            title: "Something went wrong",
            description: data.message || "Failed to start session",
            type: "error"
          }) 
      }

      router.replace(`/room/${data.roomId}`)

    } catch (error) {
      showTaost({
        title: "Error",
        description: "Failed to start practice. Please try again.",
        type: "error"
      })
      console.error("Error starting practice:", error)
    }
  }

  return (
    <Button
    onClick={() => startPracticeHandler()}
    >
      Start Practice
      <ArrowUpRight />
    </Button>
  )
}
