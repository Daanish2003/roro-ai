"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { cn } from "@roro-ai/ui/lib/utils"

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}: {
  text: string
  revealText: string
  children?: React.ReactNode
  className?: string
}) => {
  const [widthPercentage, setWidthPercentage] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [left, setLeft] = useState(0)
  const [localWidth, setLocalWidth] = useState(0)
  const [isMouseOver, setIsMouseOver] = useState(false)

  useEffect(() => {
    if (cardRef.current) {
      const { left, width } = cardRef.current.getBoundingClientRect()
      setLeft(left)
      setLocalWidth(width)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e
    if (cardRef.current) {
      const relativeX = clientX - left
      setWidthPercentage((relativeX / localWidth) * 100)
    }
  }

  const handleMouseEnter = () => {
    setIsMouseOver(true)
  }

  const handleMouseLeave = () => {
    setIsMouseOver(false)
    setWidthPercentage(0)
  }

  const gradientClassName = cn("absolute h-full w-full transition-opacity", isMouseOver ? "opacity-100" : "opacity-0")

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-green-900/20 bg-background p-8 text-center",
        className,
      )}
    >
      <div className={gradientClassName}>
        <div
          className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-green-700/20 to-green-900/20"
          style={{
            maskImage: `linear-gradient(to right, black ${widthPercentage}%, transparent ${widthPercentage}%)`,
            WebkitMaskImage: `linear-gradient(to right, black ${widthPercentage}%, transparent ${widthPercentage}%)`,
          }}
        />
      </div>

      <div className="pointer-events-none relative z-10">
        <div className="absolute -left-1 top-0 w-full text-2xl font-bold text-green-500">
          <div
            className="truncate"
            style={{
              width: `${widthPercentage}%`,
            }}
          >
            {revealText}
          </div>
        </div>
        <div className="text-2xl font-bold">{text}</div>
        {children}
      </div>
    </motion.div>
  )
}
