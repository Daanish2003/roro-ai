import { useEffect, useRef, useState } from 'react';

export default function AiVoiceAgentContainer({ localAudioRef }: { localAudioRef: React.RefObject<HTMLAudioElement | null> }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(10); // Minimum height for the dots

  useEffect(() => {
    if (localAudioRef.current && !sourceRef.current) {
      const audioElement = localAudioRef.current;
      audioContextRef.current = new AudioContext();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const checkAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const audioLevel = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(audioLevel);
        }
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      return () => {
        audioContextRef.current?.close();
      };
    }
  }, [localAudioRef]);

  return (
    <div className="flex-grow bg-card rounded-2xl overflow-hidden sm:h-[34rem] lg:h-[45rem] p-2 border border-zinc-700">
      <div className="w-full h-full object-fill rounded-2xl lg:aspect-[16/2] sm:aspect-[16/10] aspect-[17/16] flex items-center justify-center gap-2">
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease, width 0.3s ease' }}/>
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease, width 0.3s ease' }}/>
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease, width 0.3s ease' }}/>
      </div>
      <audio ref={localAudioRef} className='hidden' autoPlay/>
    </div>
  );
}
