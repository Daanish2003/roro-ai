"use client"
import { useMediasoupStore } from '@/store/useMediasoupStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const { joined } = useMediasoupStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter()

  useEffect(() => {
    if (!joined) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          router.push('/practice');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [joined, router]);

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
