import { Button } from '@roro-ai/ui/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function PracticeButton() {
  return (
    <Button
    asChild
    className='rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-500/20'
    >
        <Link
        href="./practice"
        >
            Get Started
            <ArrowUpRight />
        </Link>
    </Button>
  )
}
