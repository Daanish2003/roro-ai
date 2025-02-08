"use client"

import useMediasoup from '@/hooks/use-mediasoup'
import useSocket from '@/hooks/use-socket'
import React, { useEffect, useState } from 'react'
import Loader from '../global/loader'
import useShowToast from '@/hooks/use-show-toast'

import { Button } from '@roro-ai/ui/components/ui/button'
import { Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react'

export default function RoomContainer(
  {
    roomId,
    userId,
    username
  }: {
    roomId: string
    userId: string
    username: string
  }
) {
  const {
    connect,
    disconnect,
    isConnected,
    error,
    loading,
  } = useSocket()

  const {
    getUserMedia,
    localVideoRef,
    isRoomJoinLoading,
    initializeRoom,
    localStream,
  } = useMediasoup(roomId, userId, username)


  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const showToast = useShowToast()

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  useEffect(() => {
    if (!isConnected) return;

    const initializeMedia = async () => {
      await getUserMedia();
    }

    initializeMedia()

  }, [getUserMedia, isConnected])

  useEffect(() => {
    if (localStream) {
     
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {

        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
     
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);
  


  if (loading) {
    return <Loader />
  }

  if (error) {
    showToast({
      title: "Something went wrong",
      description: error,
      type: "error"
    })
  }

  return (
    <div className="bg-card w-full min-h-screen flex flex-col lg:flex-row p-2 gap-2">
      {/* left section */}
      <div className="lg:w-3/4 flex flex-col gap-2">
        <div className="flex-grow">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-fill rounded-2xl lg:aspect-[16/2] sm:aspect-[16/10] aspect-[17/16]" />
        </div>
        <div className="flex items-center justify-center p-4 border-2 rounded-2xl">
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      {/* right section */}
      <div className="bg-card lg:w-1/4 flex flex-col items-center justify-center rounded-2xl border p-4 gap-y-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Ready to Join Session?</h2>
          <p className="text-muted-foreground text-sm">Room ID: {roomId}</p>
        </div>
        <div className="flex w-full gap-2 justify-center">
            <Button
              variant={"default"}
              size={"lg"}
              onClick={initializeRoom}
              disabled={isRoomJoinLoading}
            >
                Join
            </Button>
            <Button
              variant={"outline"}
              size={"lg"}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
            >
            Exit
          </Button>
        </div>
      </div>
    </div>
  )
}