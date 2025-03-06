interface AiVoiceAgentContainerProps {
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiVoiceAgentContainer({ remoteAudioRef }: AiVoiceAgentContainerProps) {

  return (
    <div className="relative w-full h-full rounded-2xl border flex flex-col items-center justify-center p-4">
      <audio 
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />
      <div className="w-full flex items-center justify-around gap-2">
        <div className='bg-primary w-12 rounded-full'/>
        <div className='bg-primary w-12 rounded-full'/>
        <div className='bg-primary w-12 rounded-full'/>
      </div>
    </div>
  );
}
