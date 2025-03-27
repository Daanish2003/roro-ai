interface AiVoiceAgentContainerProps {
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiVoiceAgentContainer({ remoteAudioRef }: AiVoiceAgentContainerProps) {

  return (
    <div className="border rounded-2xl h-[40rem] w-[36rem] ml-6">
      <audio 
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />
      <div className="flex items-center justify-around gap-2 rounded-2xl object-cover h-full w-full">
        <div className='bg-primary w-12 rounded-full'/>
        <div className='bg-primary w-12 rounded-full'/>
        <div className='bg-primary w-12 rounded-full'/>
      </div>
    </div>
  );
}
