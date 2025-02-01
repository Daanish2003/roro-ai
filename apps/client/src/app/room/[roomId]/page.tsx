import RoomContainer from '@/components/room/room-container'
import React from 'react'

export default async function RoomPage({params}: {params: Promise<{roomId: string}>}) {
  const roomId = (await params).roomId

  return (
    <RoomContainer 
    roomId={roomId}
    />
  )
}
