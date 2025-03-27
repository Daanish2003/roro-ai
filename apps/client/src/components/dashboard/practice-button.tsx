import { Button } from '@roro-ai/ui/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function PracticeButton() {
  return (
    <Button
    asChild
    variant={"link"}
    className='text-accent-foreground'
    >
        <Link
        href="./practice"
        >
            Practice
            <ArrowUpRight />
        </Link>
    </Button>
  )
}
