"use client"
import { Button } from '@roro-ai/ui/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function PracticeButton() {
  const router = useRouter()

  const startPracticeHandler = async () => {
    router.push("/dashboard/practice")
  }

  return (
    <div className='border border-dashed h-[39rem] rounded-md flex items-center justify-center m-5'>
    <Button
    onClick={() => startPracticeHandler()}
    >
      Start Practice
      <ArrowUpRight />
    </Button>
    </div>
  )
}
