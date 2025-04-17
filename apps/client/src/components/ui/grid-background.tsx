"use client"

import { cn } from "@roro-ai/ui/lib/utils"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface GridBackgroundProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  dotClassName?: string
  dotSize?: number
  dotSpacing?: number
  dotColor?: string
  dotOpacity?: number
  dotBorderRadius?: string
  hoverEffect?: boolean
}

export function GridBackground({
  children,
  className,
  containerClassName,
  dotClassName,
  dotSize = 1,
  dotSpacing = 20,
  dotColor = "#22c55e",
  dotOpacity = 0.2,
  dotBorderRadius = "50%",
  hoverEffect = true,
}: GridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dots, setDots] = useState<{ x: number; y: number; opacity: number }[]>([])
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const { width, height } = containerRef.current.getBoundingClientRect()
    const dotsArray = []

    const numDotsX = Math.floor(width / dotSpacing)
    const numDotsY = Math.floor(height / dotSpacing)

    for (let i = 0; i < numDotsX; i++) {
      for (let j = 0; j < numDotsY; j++) {
        dotsArray.push({
          x: i * dotSpacing,
          y: j * dotSpacing,
          opacity: dotOpacity,
        })
      }
    }

    setDots(dotsArray)

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const { left, top } = containerRef.current.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      setMousePosition({ x, y })
    }

    const handleMouseLeave = () => {
      setMousePosition(null)
    }

    if (hoverEffect) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (hoverEffect) {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [dotSpacing, dotOpacity, hoverEffect])

  useEffect(() => {
    if (!mousePosition || !hoverEffect || !containerRef.current) {
      setDots((prevDots) =>
        prevDots.map((dot) => ({
          ...dot,
          opacity: dotOpacity,
        })),
      )
      return
    }

    setDots((prevDots) =>
      prevDots.map((dot) => {
        const distance = Math.sqrt(Math.pow(dot.x - mousePosition.x, 2) + Math.pow(dot.y - mousePosition.y, 2))
        const maxDistance = 100
        const opacity = distance < maxDistance ? dotOpacity * (distance / maxDistance) : dotOpacity
        return {
          ...dot,
          opacity,
        }
      }),
    )
  }, [mousePosition, dotOpacity, hoverEffect])

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", containerClassName)}>
      <div className={cn("absolute inset-0 z-10", className)}>
        {dots.map((dot, idx) => (
          <div
            key={idx}
            className={cn("absolute rounded-full", dotClassName)}
            style={{
              left: dot.x,
              top: dot.y,
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
              opacity: dot.opacity,
              borderRadius: dotBorderRadius,
            }}
          />
        ))}
      </div>
      <div className="relative z-20">{children}</div>
    </div>
  )
}
