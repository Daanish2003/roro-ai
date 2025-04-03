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

      // Create audio context
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      // Connect audio element to analyser
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
      const barWidth = width / 10;
      const barSpacing = barWidth * 1.5;
      const centerX = width / 2;
      const centerY = height / 2;
      const minBarHeight = 10;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, width, height);

        const avgVolume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        const barHeight = Math.max((avgVolume / 255) * (height / 2), minBarHeight);

        ctx.fillStyle = "hsl(142.1, 76.2%, 36.3%)";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        [-1, 0, 1].forEach((i) => {
          const x = centerX + i * barSpacing - barWidth / 2;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, barWidth / 2);
          ctx.fill();
        });
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

  return <canvas ref={canvasRef} width={300} height={200} className="w-full h-full" />;
}