"use client"
import { useMediaStore } from '@/store/useMedia';
import { useMediasoupStore } from '@/store/useMediasoupStore';
import { Button } from '@roro-ai/ui/components/ui/button';
import { SidebarTrigger } from '@roro-ai/ui/components/ui/sidebar';
import { MessageSquareText, Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useRef } from 'react';

export default function Controller() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const { exitRoom } = useMediasoupStore();
  const params = useParams()
  const localStream = useMediaStore((state) => state.localStream);

  const roomId = params.roomId as string || ""

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
      <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={() => exitRoom(roomId)}>
        <PhoneOff className="h-5 w-5" />
      </Button>
      <div
      className='cursor-pointer h-12 w-12 rounded-full border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 items-center justify-center flex'
      onClick={() => triggerRef.current?.click()}
      >
           <MessageSquareText />
          <SidebarTrigger ref={triggerRef} className="sr-only hidden" />
      </div>
    </div>
  );
}
