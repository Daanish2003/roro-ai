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



  
  return (
    <div className="border rounded-2xl lg:h-[36rem] lg:w-1/2 h-[18rem] w-[28rem] md:h-[40rem] md:w-1/2 flex flex-col">
      {(!ready && joined) && (
        <h1 className="text-primary font-medium">Connecting...</h1>
      )}
      <audio ref={remoteAudioRef} autoPlay   className="hidden" />
      <div className="flex-1 flex items-center justify-center p-4 flex-col">
        <div className="w-full h-52 flex items-center justify-center">
           <AudioVisualizer audioRef={remoteAudioRef} />
        </div>
        {listening ? (
          <h1 className="text-primary font-medium">Listening...</h1>
        ) : (
          <h1></h1>
        )}
      </div>
    </div>
  )
}
