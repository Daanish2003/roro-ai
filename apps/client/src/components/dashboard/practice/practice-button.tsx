"use client"

import { Button } from '@/components/ui/button'
import { useSocket } from '@/hooks/use-socket'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'


export default function PracticeButton() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const createRoom = () => {
    if (socket && isConnected) {
      socket.emit("createRoom", (response: { roomId: string }) => {
        console.log("Room created with ID:", response.roomId);
        router.push(`/room/${response.roomId}`);
      });
    } else {
      console.error("Socket not connected");
    }
  };


  return (
    <Button
    onClick={() => createRoom()}
    disabled={!isConnected}
    >
        Start Practing
        <ArrowUpRight />
    </Button>
  )
}
