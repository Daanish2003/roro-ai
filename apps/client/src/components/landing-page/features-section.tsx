"use client"

import {
  Brain,
  Headphones,
  BarChart3,
  Mic,
  Sparkles,
  Clock,
  Globe,
  UserCheck,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@roro-ai/ui/components/ui/card"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { AnimatedGradientBorder } from "../ui/animated-gradient"

const features = [
  {
    icon: <Mic className="h-10 w-10 text-green-500" />,
    title: "Real-time Conversations",
    description:
      "Practice speaking with an AI that listens and responds naturally in real-time.",
  },
  {
    icon: <Brain className="h-10 w-10 text-green-500" />,
    title: "Personalized Learning",
    description:
      "Adapts to your skill level and provides tailored feedback to help you improve.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-green-500" />,
    title: "Progress Tracking",
    description:
      "Monitor your improvement over time with detailed analytics and insights.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-green-500" />,
    title: "Accent Neutral",
    description:
      "Improve your fluency and understanding by speaking with different accents",
  },
  {
    icon: <Clock className="h-10 w-10 text-green-500" />,
    title: "24/7 Availability",
    description:
      "Practice whenever you want, as much as you want, without scheduling.",
  },
  {
    icon: <Globe className="h-10 w-10 text-green-500" />,
    title: "Diverse Topics",
    description:
      "Engage in conversations about a wide range of topics to build vocabulary.",
  },
  {
    icon: <UserCheck className="h-10 w-10 text-green-500" />,
    title: "Confidence Building",
    description:
      "Speak freely and confidently without fear of being judged by others"
  },
  {
    icon: <Headphones className="h-10 w-10 text-green-500" />,
    title: "Clear Pronunciation",
    description:
      "Get feedback on your pronunciation to speak more clearly and naturally.",
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section
      id="features"
      className="py-20 bg-secondary/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)]"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose Roro AI?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform offers unique advantages to help you master
            English speaking skills
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item} className="h-64 w-full">
              <AnimatedGradientBorder duration={4 + index} className="h-full w-full">
                <Card className="h-full w-full bg-background/60 backdrop-blur-sm border-0 p-4 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedGradientBorder>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}