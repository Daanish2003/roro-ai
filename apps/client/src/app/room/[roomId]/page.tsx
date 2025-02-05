"use client"

import RoomContainer from '@/components/room/room-container'
import { useSession } from '@/lib/auth-client'
import { useParams } from 'next/navigation'
import React from 'react'

export default function RoomPage() {
  const params = useParams()
  const {data:session} = useSession()

  const roomId = params.roomId as string || ""

  if(!session) {
    return null
  }

  return (
    <RoomContainer 
    roomId={roomId}
    userId={session.user.id}
    />
  )
}
