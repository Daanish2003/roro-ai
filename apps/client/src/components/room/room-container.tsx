"use client"

import VideoContainer from './video-container'
import AiVoiceAgentContainer from './ai-voice-agent-container'
import { useSocketStore } from '@/store/useSocketStore'
import React, { useEffect } from 'react'
import Join from './join'
import Controller from './controller'
import { useMediaStore } from '@/store/useMedia'
import { useMediasoupStore } from '@/store/useMediasoupStore'


export default function RoomContainer() {
  const connect = useSocketStore((state) => state.connect)
  const disconnect = useSocketStore((state) => state.disconnect)
  const isConnected = useSocketStore((state) => state.isConnected)
  const getUserMedia = useMediaStore((state) => state.getUserMedia)
  const remoteStream = useMediasoupStore((state) => state.remoteStream)
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
      remoteAudioRef.current.srcObject = audioStream;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        document.addEventListener('click', () => {
          remoteAudioRef.current?.play();
        }, { once: true });
      });
    }
  }, [remoteStream]);

  return (
    <div className="bg-card flex flex-col lg:flex-row gap-4 p-4 max-h-screen">
      {/* left section */}
      <div className="lg:w-3/4 flex flex-col gap-4 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:h-[45rem] sm:[36rem]">
          <div className="h-full">
            <AiVoiceAgentContainer remoteAudioRef={remoteAudioRef}/>
          </div>
          <div className="h-full">
            <VideoContainer localVideoRef={localVideoRef}/>
          </div>
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