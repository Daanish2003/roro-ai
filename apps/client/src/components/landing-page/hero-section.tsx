"use client"

import HeroSectionButtons from "./hero-section-buttons"
import { SparklesCore } from "@/components/ui/sparkles"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { motion } from "motion/react"

export default function HeroSection() {
  const words = [
    {
      text: "Master",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white",
    },
    {
      text: "Fluent",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-green-500",
    },
    {
      text: "English",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white",
    },
    {
      text: "Speaking",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white",
    },
    {
      text: "with",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white",
    },
    {
      text: "AI",
      className: "text-3xl md:text-4xl lg:text-5xl font-bold text-green-500",
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 relative overflow-hidden px-12">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={70}
          particleColor="#22c55e"
          speed={0.5}
        />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="space-y-2">
              <div className="h-24 md:h-32">
                <TypewriterEffect words={words} />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="text-xl text-muted-foreground"
              >
                Real-time conversations to boost confidence and fluency. Practice anytime, anywhere with Roro AI.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <HeroSectionButtons />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
            className="relative h-[400px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-700/20 rounded-3xl blur-3xl"></div>
            <div className="relative h-full w-full flex items-center justify-center">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/Z0CnmHaWdnk?si=-3JWTNTxl3qaR_DH" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="rounded-xl"></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
