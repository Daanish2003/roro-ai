import { useEffect, useRef, useState } from 'react';

interface AiVoiceAgentContainerProps {
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiVoiceAgentContainer({ remoteAudioRef }: AiVoiceAgentContainerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(10);

  useEffect(() => {
    if (remoteAudioRef.current && !sourceRef.current) {
      const audioElement = remoteAudioRef.current;
      audioContextRef.current = new AudioContext();
      // Resume context if suspended (browsers often suspend AudioContext until a user gesture)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed:', audioContextRef.current?.state);
        });
      }
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const checkAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const level = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(level);
        }
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();
      return () => {
        audioContextRef.current?.close();
      };
    }
  }, [remoteAudioRef]);

  return (
    <div className="relative w-full h-full rounded-2xl border flex flex-col items-center justify-center p-4">
      <audio 
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />
      <div className="w-full flex items-center justify-around gap-2">
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease' }}/>
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease' }}/>
        <div className='bg-primary w-12 rounded-full' style={{ height: `${audioLevel}px`, transition: 'height 0.3s ease' }}/>
      </div>
    </div>
  );
}
