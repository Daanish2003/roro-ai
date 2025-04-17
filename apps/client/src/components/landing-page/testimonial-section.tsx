"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@roro-ai/ui/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@roro-ai/ui/components/ui/avatar"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { WavyBackground } from "../ui/wave-background"

const testimonials = [
  {
    quote: "Roro AI has transformed my English speaking skills. I practice daily and my confidence has skyrocketed!",
    name: "Sarah K.",
    image: "/avatars/woman.png",
    role: "International Student",
    avatar: "SK",
  },
  {
    quote:
      "As someone preparing for job interviews, Roro AI has been invaluable. The real-time feedback helps me sound more professional.",
    name: "Raj P.",
    role: "Software Engineer",
    image: "/avatars/man.png",
    avatar: "RP",
  },
  {
    quote:
      "I've tried many language apps, but nothing compares to actually speaking with Roro AI. It feels like talking to a real teacher.",
    name: "Maria G.",
    role: "Marketing Professional",
    image: "/avatars/woman2.png",
    avatar: "MG",
  },
]

const people = [
  {
    id: 1,
    name: "Sarah K.",
    image: "/avatars/woman.png",
    designation: "International Student",
  },
  {
    id: 2,
    name: "Raj P.",
    designation: "Software Engineer",
    image: "/avatars/man.png",
  },
  {
    id: 3,
    name: "Maria G.",
    designation: "Marketing Professional",
    image: "/avatars/woman2.png",
  },
  {
    id: 4,
    name: "John D.",
    designation: "Business Analyst",
    image: "/avatars/boy.png",
  },
  {
    id: 5,
    name: "Lisa T.",
    designation: "ESL Teacher",
    image: "/avatars/human.png",
  },
]

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <WavyBackground
        className="absolute inset-0 z-0"
        colors={["#22c55e20", "#16a34a20", "#15803d20"]}
        waveWidth={100}
        backgroundFill="transparent"
        blur={10}
        speed="slow"
        waveOpacity={0.5}
        waveOpacityHover={0.8}
      />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied users who have improved their English speaking skills with Roro AI
          </p>
        </motion.div>

        <div className="mb-16 flex justify-center">
          <AnimatedTooltip items={people} />
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-background/60 backdrop-blur-sm border-green-900/20 h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-green-500/30">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-green-700">{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="italic">{testimonial.quote}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex text-green-500">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
