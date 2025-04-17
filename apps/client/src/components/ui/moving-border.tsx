"use client"

import type React from "react"
import { cn } from "@roro-ai/ui/lib/utils"
import { motion } from "motion/react"

export const MovingBorder = ({
  children,
  duration = 2000,
  rx = "16px",
  ry = "16px",
  className,
  containerClassName,
  borderClassName,
  as: Component = "div",
}: {
  children: React.ReactNode
  duration?: number
  rx?: string
  ry?: string
  className?: string
  containerClassName?: string
  borderClassName?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any
}) => {
  return (
    <Component className={cn("relative p-[1px] overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 z-[1] opacity-40 dark:opacity-60",
          "bg-[radial-gradient(var(--green-500)_40%,transparent_60%)]",
          borderClassName,
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="smallGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      <motion.div
        className={cn("absolute inset-0 z-[1]", borderClassName)}
        style={{
          background: `linear-gradient(to right, #22c55e, #16a34a, #15803d, #22c55e)`,
        }}
      >
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" rx={rx} ry={ry} fill="none" stroke="url(#gradient)" strokeWidth="2" />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              animate={{
                x1: ["0%", "100%", "0%"],
                x2: ["100%", "0%", "100%"],
                y1: ["0%", "100%", "0%"],
                y2: ["100%", "0%", "100%"],
              }}
              transition={{
                duration: duration / 1000,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <stop stopColor="#22c55e" stopOpacity="1" />
              <stop offset="0.33" stopColor="#16a34a" stopOpacity="1" />
              <stop offset="0.66" stopColor="#15803d" stopOpacity="1" />
              <stop offset="1" stopColor="#22c55e" stopOpacity="1" />
            </motion.linearGradient>
          </defs>
        </svg>
      </motion.div>

      <div className={cn("relative z-[2] bg-background", className)}>{children}</div>
    </Component>
  )
}
