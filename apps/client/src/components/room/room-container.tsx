"use client"

import { useSocketStore } from '@/store/useSocketStore'
import React, { useEffect } from 'react'
import { useMediaStore } from '@/store/useMedia'
import { useMediasoupStore } from '@/store/useMediasoupStore'
import AiVoiceAgentContainer from './ai-voice-agent-container'
import VideoContainer from './video-container'
import Controller from './controller'
import JoinButton from './join-button'


export default function RoomContainer() {
  const { connect, disconnect, isConnected} = useSocketStore()
  const { remoteStream, joined} = useMediasoupStore()
  const getUserMedia = useMediaStore((state) => state.getUserMedia)
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const remoteAudioRef = React.useRef<HTMLAudioElement | null>(null)
  

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
    if (!remoteStream) return;
    console.log('Remote stream updated:', remoteStream);
    const audioTrack = remoteStream.getAudioTracks()[0];
    if (remoteAudioRef.current && audioTrack) {
      console.log('Setting up audio track:', audioTrack.label);
      const audioStream = new MediaStream([audioTrack]);
      console.log(audioStream)
      remoteAudioRef.current.srcObject = audioStream;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.autoplay = true
    }
  }, [remoteStream]);

  return (
    <>
      <div className='flex flex-col items-center md:gap-x-2 mt-2 md:flex-row gap-y-2 mb-2'>
         <AiVoiceAgentContainer remoteAudioRef={remoteAudioRef}/>
         <VideoContainer localVideoRef={localVideoRef}/>
      </div>
      <div className="w-full flex items-center justify-center py-4 border-t">
        { joined ? (
          <Controller />
        ) : (
          <JoinButton />
        )}
      </div>
    </>
  )
}