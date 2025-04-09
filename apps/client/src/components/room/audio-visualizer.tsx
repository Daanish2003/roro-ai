"use client";

import type React from "react";
import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AudioVisualizer({ audioRef }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;

    const setupAudioAnalyser = () => {
      if (!audioRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if(audioContext.state === 'suspended') {
        console.log('suspended')
      }
      audioContextRef.current = audioContext;

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      if (audioRef.current.srcObject) {
        source = audioContext.createMediaStreamSource(audioRef.current.srcObject as MediaStream);
        source.connect(analyser);
        sourceRef.current = source;
      } else if (audioRef.current.src) {
        source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
      }

      visualize();
    };

    const visualize = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const baseSize = 50; 
      const maxStretch = 150; 
      const circleCount = 5;
      const barSpacing = width / (circleCount + 1);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
      
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, width, height);
      
        ctx.fillStyle = "hsl(142.1, 76.2%, 36.3%)";
        ctx.shadowBlur = 0; 
      
        for (let i = 0; i < circleCount; i++) {
          const volume = dataArray[i] ?? 0;
          const volumeFactor = volume / 255;
      
          const stretch = volumeFactor * maxStretch;
          const barSize = baseSize;
          const totalHeight = barSize + stretch;
          const x = barSpacing * (i + 1) - barSize / 2;
          const y = centerY - totalHeight / 2;
          const radius = barSize / 2;
      
          ctx.beginPath();
          ctx.roundRect(x, y, barSize, totalHeight, radius);
          ctx.fill();
        }
      };

      draw();
    };

    const handlePlay = () => {
      if (!audioContextRef.current) {
        setupAudioAnalyser();
      }
    };

    const handlePause = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("pause", handlePause);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioRef]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={250}
      className="block mx-auto w-[300px] h-[250px]"
    />
  );
}
