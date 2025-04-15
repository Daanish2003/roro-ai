"use client"
import { useSocketStore } from "@/store/useSocketStore";
import AudioVisualizer from "./audio-visualizer";
import { useState } from "react";
import { useMediasoupStore } from "@/store/useMediasoupStore";

interface AiVoiceAgentContainerProps {
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiVoiceAgentContainer({ remoteAudioRef }: AiVoiceAgentContainerProps) {
  const [listening, setListening] = useState<boolean>(false);
  const { joined } = useMediasoupStore()
  const [ready, setReady] = useState<boolean>(false) 
  const { socket } = useSocketStore()

  socket?.on('START_OF_SPEECH', () => {
    setListening(true)
  })

  socket?.on('END_OF_SPEECH', () => {
    setListening(false)
  })

  socket?.on('STT_CONNECTED', () => {
    setReady(true)
  })

  socket?.on('STT_DISCONNECTED', () => {
    setReady(false)
  })

  
  return (
    <div className="border rounded-2xl lg:h-[32rem] lg:w-1/2 h-[16rem] w-[28rem] md:h-[32rem] md:w-1/2 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay   className="hidden" />
      <div className="flex-1 flex items-center justify-center p-4 flex-col">
        <div className="w-full h-52 flex items-center justify-center">
           <AudioVisualizer audioRef={remoteAudioRef} />
        </div>
        {(!ready && joined) && (
        <h1 className="text-primary font-medium">Connecting...</h1>
      )}
        {listening && (
          <h1 className="text-primary font-medium">Listening...</h1>
        )}
      </div>
    </div>
  )
}
