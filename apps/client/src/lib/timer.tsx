"use client"
import { useMediasoupStore } from '@/store/useMediasoupStore';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const CountdownTimer = () => {
  const params = useParams()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const { joined, exitRoom } = useMediasoupStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = (params.roomId as string) || ""
  

  useEffect(() => {
    if (!joined) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          exitRoom(roomId, router)
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      exitRoom(roomId, router)
    };
  }, [joined, exitRoom, roomId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className='border px-4 py-2 border-primary rounded-xl'>
      <h2>{formatTime(timeLeft)}</h2>
    </div>
  );
};

export default CountdownTimer;
