"use client"

import type { ReactNode } from "react"
import { cn } from "@roro-ai/ui/lib/utils"

interface AnimatedGradientBorderProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  borderClassName?: string
  duration?: number
  borderWidth?: number
}

export const AnimatedGradientBorder = ({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 6,
}: AnimatedGradientBorderProps) => {
  return (
    <div className={cn("relative rounded-xl p-[1px] overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl z-[1]",
          `[background:linear-gradient(to_right,#22c55e,#16a34a,#15803d,#22c55e)] dark:[background:linear-gradient(to_right,#22c55e,#16a34a,#15803d,#22c55e)]`,
          "animate-gradient",
          borderClassName,
        )}
        style={{
          backgroundSize: "300% 100%",
          animationDuration: `${duration}s`,
        }}
      />
      <div
        className={cn(
          "relative z-[2] rounded-[calc(0.75rem-1px)] bg-background",
          "flex items-center justify-center",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
