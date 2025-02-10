"use client"

import VideoContainer from './video-container'
import AiVoiceAgentContainer from './ai-voice-agent-container'
import { useSocketStore } from '@/store/useSocketStore'
import React, { useEffect } from 'react'
import Join from './join'
import Controller from './controller'
import { useMediaStore } from '@/store/useMedia'
import { useMediasoupConsumerStore } from '@/store/useMediasoupConsumerStore'


export default function RoomContainer() {
  const connect = useSocketStore((state) => state.connect)
  const disconnect = useSocketStore((state) => state.disconnect)
  const isConnected = useSocketStore((state) => state.isConnected)
  const getUserMedia = useMediaStore((state) => state.getUserMedia)
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const localAudioRef = React.useRef<HTMLAudioElement | null>(null)
  

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (!isConnected) return; 

    const initializeMedia = async () => {
      try {
        await getUserMedia();
        const localStream = useMediaStore.getState().localStream;

        if (!localStream) {
          console.error("No local stream available.");
          return;
        }

        const [videoTrack] = localStream.getVideoTracks();
        if (localVideoRef.current && videoTrack) {
          localVideoRef.current.srcObject = new MediaStream([videoTrack]);
          await localVideoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      } catch (error) {
        console.error("Error initializing media:", error);
      }
    };

    initializeMedia();
  }, [isConnected, getUserMedia])

  useEffect(() => {
    const audioTrack = useMediasoupConsumerStore.getState().remoteStream?.getAudioTracks()[0];
    if (localAudioRef.current && audioTrack) {
      localAudioRef.current.srcObject = new MediaStream([audioTrack]);
      localAudioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    }
  })



  return (
    <div className="bg-card w-full min-h-screen flex flex-col lg:flex-row p-2 gap-2">
      {/* left section */}
      <div className="lg:w-3/4 flex flex-col gap-2 shadow-inner">
        <div className='grid sm:grid-cols-2 gap-2 h-[34rem] lg:h-[45rem] grid-rows-2'>
         <AiVoiceAgentContainer localAudioRef={localAudioRef}/>
         <VideoContainer localVideoRef={localVideoRef}/>
        </div>
        <div className="flex items-center justify-center p-4 border-2 rounded-2xl">
          <Controller />
        </div>
      </div>
      {/* right section */}
      <Join />
    </div>
  )
}