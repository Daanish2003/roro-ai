"use client"

import Link from "next/link"
import { Button } from "@roro-ai/ui/components/ui/button"
import { Github, Twitter, Linkedin } from "lucide-react"
import { motion } from "motion/react"

export default function FooterSection() {
  return (
    <footer className="bg-background border-t relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(34,197,94,0.1),transparent_70%)]"></div>

      <div className="container px-4 md:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-r from-green-500 to-green-700 p-1 shadow-lg shadow-green-500/20">
                <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
                  <span className="text-green-500 font-bold">R</span>
                </div>
              </div>
              <span className="font-bold text-xl">Roro AI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Master fluent English speaking with AI-powered practice. Real-time conversations to boost confidence and
              fluency.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-medium text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Testimonials
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  FAQ
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Blog
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Documentation
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Community
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Support
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  About Us
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Careers
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Privacy Policy
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors relative group inline-block"
                >
                  Terms of Service
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500/50 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Roro AI. All rights reserved.</p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            A product by{" "}
            <Link href="https://x.com/daanish288275" className="text-primary font-semibold hover:underline">
              @Daanish
            </Link>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
