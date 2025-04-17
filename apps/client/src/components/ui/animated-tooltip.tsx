"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@roro-ai/ui/lib/utils"
import Image from "next/image"

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number
    name: string
    designation: string
    image: string
  }[]
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
      {items.map((item) => (
        <TooltipComponent key={item.id} item={item} />
      ))}
    </div>
  )
}

const TooltipComponent = ({
  item,
}: {
  item: {
    id: number
    name: string
    designation: string
    image: string
  }
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 border-green-500/30 bg-background p-1 transition-all duration-300",
          isHovered && "border-green-500",
        )}
      >
        <Image
          src={item.image}
          alt={item.name}
          width={30}
          height={30}
          className="rounded-full h-12 w-12 md:h-16 md:w-16 object-cover"
        />
      </div>
      {isHovered && (
        <motion.div
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          exit={{ opacity: 0, y: 20, scale: 0.6 }}
        >
          <div className="flex flex-col items-center justify-center rounded-md bg-black/80 backdrop-blur-sm px-4 py-2 shadow-xl">
            <p className="text-base font-bold text-white">{item.name}</p>
            <p className="text-xs text-green-300">{item.designation}</p>
          </div>
          <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-black/80"></div>
        </motion.div>
      )}
    </div>
  )
}
