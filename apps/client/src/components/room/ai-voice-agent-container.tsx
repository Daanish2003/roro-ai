import { useSocketStore } from "@/store/useSocketStore";
import AudioVisualizer from "./audio-visualizer";

interface AiVoiceAgentContainerProps {
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiVoiceAgentContainer({ remoteAudioRef }: AiVoiceAgentContainerProps) {
  const { socket } = useSocketStore()

  socket?.on('START_OF_SPEECH', () => {
    console.log("start")
  })

  socket?.on('END_OF_SPEECH', () => {
    console.log("end")
  })
  
  return (
    <div className="border rounded-2xl lg:h-[40rem] lg:w-1/2 h-[18rem] w-[28rem] md:h-[40rem] md:w-1/2 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full h-32">
          <AudioVisualizer audioRef={remoteAudioRef} />
        </div>
      </div>
      <h1></h1>
    </div>
  )
}
