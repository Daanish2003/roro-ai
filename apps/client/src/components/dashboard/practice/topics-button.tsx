import { HoverBorderGradient } from '@/components/hover-border-gradient'
import React from 'react'

export default function TopicsButton({topic, onClick}: {topic: string, onClick: () => void}) {
  return (
    <button
     type='button'
     tabIndex={0}
     onClick={(e) => {
       e.preventDefault();
       onClick()
     }}
    >
      <HoverBorderGradient
        containerClassName="rounded-full"
        as={"div"}
        className="bg-background/90 border-primary border flex items-center space-x-2"
      >
        <span>{topic}</span>
      </HoverBorderGradient>
    </button>
  )
}
