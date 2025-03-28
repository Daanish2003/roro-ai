"use client"

import { useSession } from '@/features/auth/auth-client'
import { useRoomStore } from '@/store/useRoomStore'
import { Button } from '@roro-ai/ui/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

export default function JoinButton() {
    const router = useRouter()
    const params = useParams()
    const { data } = useSession()
    const {joinHandler, exitHandler} = useRoomStore()

    const roomId = params.roomId as string || ""

    if(!data) {
        return null
    }

  return (
    <>
      <div className="flex w-full gap-2 justify-center">
        <Button
          variant={"default"}
          size={"lg"}
          onClick={() => joinHandler({roomId, userId: data.user.id})}
        >
          Join
        </Button>
        <Button
          variant={"outline"}
          size={"lg"}
          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          onClick={() => exitHandler(router)}
        >
          Exit
        </Button>
      </div>
    </>
  )
}
