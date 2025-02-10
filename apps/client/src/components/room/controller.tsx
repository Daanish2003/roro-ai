import { useMediaStore } from '@/store/useMedia';
import { Button } from '@roro-ai/ui/components/ui/button';
import { Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react';
import React from 'react';

export default function Controller() {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const localStream = useMediaStore((state) => state.localStream);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff((prev) => !prev);
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
        onClick={toggleMute}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
        onClick={toggleCamera}
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
      >
        <Settings className="h-5 w-5" />
      </Button>
      <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full">
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
