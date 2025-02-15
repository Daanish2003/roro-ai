import { HoverBorderGradient } from '@/components/hover-border-gradient'
import React from 'react'

export default function TopicsButton({topic}: {topic: string}) {
  return (
    <div className="">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="bg-card/90 border-primary border flex items-center space-x-2"
      >
        <span>{topic}</span>
      </HoverBorderGradient>
    </div>
  )
}
