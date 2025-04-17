"use client"

import { cn } from "@roro-ai/ui/lib/utils"
import { useEffect, useState } from "react"
import { createNoise3D } from "simplex-noise"

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: {
  id?: string
  className?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  particleDensity?: number
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [noise, setNoise] = useState<any>(null)

  useEffect(() => {
    setNoise(createNoise3D())
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const canvas = document.getElementById(id || "canvas") as HTMLCanvasElement
        if (canvas) {
          const ctx = canvas.getContext("2d")
          const width = window.innerWidth
          const height = window.innerHeight

          if (ctx && (width !== canvasSize.width || height !== canvasSize.height)) {
            canvas.width = width
            canvas.height = height
            setCanvasSize({ width, height })
          }
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [canvasSize, id])

  useEffect(() => {
    if (!noise || !canvasSize.width || !canvasSize.height) return

    const canvas = document.getElementById(id || "canvas") as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particlesArray: Particle[] = []
    const particleMaxSize = maxSize || 3
    const particleMinSize = minSize || 1
    const particleMaxCount = particleDensity || 100
    const bgColor = background || "transparent"
    const pColor = particleColor || "#22c55e"
    const moveSpeed = speed || 0.1

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvasSize.width
        this.y = Math.random() * canvasSize.height
        this.size = Math.random() * (particleMaxSize - particleMinSize) + particleMinSize
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.color = pColor
      }

      update(time: number) {
        const n = noise(this.x * 0.01, this.y * 0.01, time * 0.1)
        const angle = n * Math.PI * 2

        this.x += Math.cos(angle) * moveSpeed
        this.y += Math.sin(angle) * moveSpeed

        if (this.x > canvasSize.width) {
          this.x = 0
        } else if (this.x < 0) {
          this.x = canvasSize.width
        }

        if (this.y > canvasSize.height) {
          this.y = 0
        } else if (this.y < 0) {
          this.y = canvasSize.height
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < particleMaxCount; i++) {
        particlesArray.push(new Particle())
      }
    }

    const animate = () => {
      if (!ctx) return
      ctx.fillStyle = bgColor
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

      const time = performance.now() * 0.001

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(time)
        particlesArray[i].draw()
      }
      requestAnimationFrame(animate)
    }

    init()
    animate()
  }, [noise, canvasSize, id, background, maxSize, minSize, particleColor, particleDensity, speed])

  return (
    <canvas
      id={id || "canvas"}
      className={cn("h-full w-full", className)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  )
}
