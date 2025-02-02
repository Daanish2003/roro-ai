"use client"

import useMediasoup from '@/hooks/use-mediasoup'
import useSocket from '@/hooks/use-socket'
import React, { useEffect } from 'react'
import Loader from '../global/loader'
import useShowToast from '@/hooks/use-show-toast'

export default function RoomContainer(
  { 
    roomId 
  }:{
    roomId: string
  }
) {
  const { connect, disconnect, isConnected, error, loading } = useSocket()
  const { cleanup } = useMediasoup(roomId)
  const showToast = useShowToast()

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
  if (loading) {
    return <Loader />
  }

  if(error) {
    showToast({
      title: "Something went wrong",
      description: error,
      type: "error"
    })
  }
  return (
    <div>{roomId}</div>
  )
}