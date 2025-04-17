"use client"

import { Cpu, Headphones, Brain, Mic } from "lucide-react"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { TextRevealCard } from "@/components/ui/text-reveal-card"

const technologies = [
  {
    icon: <Headphones className="h-12 w-12 text-green-500" />,
    title: "MediaSoup",
    description: "Real-time, low-latency audio communication for seamless conversations.",
  },
  {
    icon: <Brain className="h-12 w-12 text-green-500" />,
    title: "Gemini 2.0 Flash Lite",
    description: "Fast and context-aware large language model for generating smart, engaging responses.",
  },
  {
    icon: <Mic className="h-12 w-12 text-green-500" />,
    title: "Deepgram",
    description: "High-performance speech-to-text (STT) and text-to-speech (TTS) engine for natural conversation flow.",
  },
  {
    icon: <Cpu className="h-12 w-12 text-green-500" />,
    title: "Silero VAD",
    description: "Lightweight and efficient voice activity detection for accurate speech segmentation.",
  },
]

export default function TechStackSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="tech" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_50%)]"></div>

      <div className="container px-4 md:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
         animate={isInView ? { opacity: 1, y: 0 } : {}}
         transition={{ duration: 0.7 }}
         className="text-center mb-16"
      >
       <div className="flex flex-col items-center justify-center">
         <TextRevealCard
           text="Powered by Cutting-Edge Tech"
           revealText="Powered by Cutting-Edge Tech"
           className="mx-auto w-full max-w-lg h-24 flex items-center justify-center mb-4"
         />
        <p className="text-base text-muted-foreground max-w-md mx-auto mt-2">
          Roro AI combines powerful technologies to deliver seamless voice interactions
        </p>
      </div>
     </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-64"
            >
              <CardContainer className="w-full h-full">
                <CardBody className="bg-background/60 backdrop-blur-sm border border-green-900/20 rounded-xl h-full w-full py-6 px-4 flex flex-col items-center">
                  <CardItem translateZ={20} className="flex justify-center mb-4">
                    {tech.icon}
                  </CardItem>
                  <CardItem translateZ={30} className="text-center">
                    <h3 className="text-xl font-bold">{tech.title}</h3>
                  </CardItem>
                  <CardItem translateZ={10} className="text-center mt-4 flex-grow">
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}