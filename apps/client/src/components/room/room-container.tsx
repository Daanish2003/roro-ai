"use client"

import useMediasoup from '@/hooks/use-mediasoup'
import useSocket from '@/hooks/use-socket'
import React, { useEffect } from 'react'

export default function RoomContainer(
  { 
    roomId 
  }:{
    roomId: string
  }
) {
  const { connect, disconnect } = useSocket()
  const { cleanup } = useMediasoup(roomId)

  useEffect(() => {
    connect()
    return () => {
      disconnect()
      cleanup()
    }
  }, [connect, disconnect, cleanup])

  // useEffect(() => {
  //   if(!isConnected) return;
    
  //   const initializeMedia = async () => {
  //     await getUserMedia();
      
      
  //   }

  // })

  //TODO: setup mediasoup connection
  //TODO: getUserMedia
  //TODO: display the local media
  return (
    <div>RoomContainer</div>
  )
}