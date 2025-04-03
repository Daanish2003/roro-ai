import { Badge } from "@roro-ai/ui/components/ui/badge"
import { ArrowUp } from "lucide-react";
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
      <Badge
        variant={"outline"}
        className="bg-background/90 border-primary border flex items-center rounded-full text-[13px] p-2 justify-center gap-2 content-stretch"
      >
        <span className="text-nowrap">{topic}</span>
        <ArrowUp className="w-4 h-4"/>
      </Badge>
    </button>
  )
}
