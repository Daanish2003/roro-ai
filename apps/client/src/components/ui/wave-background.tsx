"use client"

import { cn } from "@roro-ai/ui/lib/utils"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface WavyBackgroundProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  waveOpacityHover?: number
  animated?: boolean
}

export function WavyBackground({
  children,
  className,
  containerClassName,
  colors = ["#22c55e", "#16a34a", "#15803d"],
  waveWidth = 50,
  backgroundFill = "transparent",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  waveOpacityHover = 0.8,
  animated = true,
}: WavyBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [path, setPath] = useState<string>("")
  const [svgWidth, setSvgWidth] = useState<number>(0)
  const [svgHeight, setSvgHeight] = useState<number>(0)

  useEffect(() => {
    if (!containerRef.current) return

    const updatePath = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0
      const containerHeight = containerRef.current?.offsetHeight || 0

      setSvgWidth(containerWidth)
      setSvgHeight(containerHeight)

      const waveLength = waveWidth
      const numberOfWaves = Math.ceil(containerWidth / waveLength) + 1

      let pathData = `M 0 ${containerHeight} L 0 ${containerHeight / 2} `

      for (let i = 0; i < numberOfWaves; i++) {
        const x1 = i * waveLength
        const y1 = containerHeight / 2 + 20 * Math.sin((i * Math.PI) / 2)
        const x2 = (i + 0.5) * waveLength
        const y2 = containerHeight / 2 - 20
        const x3 = (i + 1) * waveLength
        const y3 = containerHeight / 2

        pathData += `C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3} `
      }

      pathData += `L ${containerWidth} ${containerHeight} Z`
      setPath(pathData)
    }

    updatePath()
    window.addEventListener("resize", updatePath)

    return () => {
      window.removeEventListener("resize", updatePath)
    }
  }, [waveWidth])

  const animationDuration = speed === "fast" ? "10s" : "20s"

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", containerClassName)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        className="absolute w-full h-full bottom-0 left-0"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          filter: `blur(${blur}px)`,
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, index) => (
              <stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity={isHovered ? waveOpacityHover : waveOpacity}
              >
                {animated && (
                  <animate
                    attributeName="offset"
                    values={`${(index / (colors.length - 1)) * 100}%;${
                      ((index + 1) / (colors.length - 1)) * 100
                    }%;${(index / (colors.length - 1)) * 100}%`}
                    dur={animationDuration}
                    repeatCount="indefinite"
                  />
                )}
              </stop>
            ))}
          </linearGradient>
        </defs>
        <path d={path} fill={backgroundFill} />
        <path d={path} fill="url(#gradient)" />
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}
