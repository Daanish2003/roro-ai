"use client"

import Link from "next/link"
import { Button } from "@roro-ai/ui/components/ui/button"
import { motion } from "motion/react"
import Logo from "./logo"
import SplitButton from "./github-start-button"

export default function LandingNavbar() {

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Logo />
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-6"
          >
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="#tech" className="text-sm font-medium hover:text-primary transition-colors relative group">
              Technology
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium hover:text-primary transition-colors relative group"
            >
              Testimonials
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full"></span>
            </Link>
          </motion.nav>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SplitButton />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-500/20">
              <Link href={"/auth/login"}>
                Get Started
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
