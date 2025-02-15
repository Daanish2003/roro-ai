"use client"

import { useSession } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@roro-ai/ui/components/ui/avatar'
import { Card } from '@roro-ai/ui/components/ui/card'
import React from 'react'
import { Progress } from "@roro-ai/ui/components/ui/progress"
import { Button } from '@roro-ai/ui/components/ui/button'

export default function ProfileCard() {
    const { data: session } = useSession()
  return (
    <Card className='h-36 px-4 flex items-center justify-between'>
        <div className='flex gap-4 items-center'>
        <Avatar className='h-24 w-24 border'>
            <AvatarImage />
            <AvatarFallback className='bg-primary text-black'>CN</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
           <h2 className='font-semibold text-accent-foreground'>{session?.user.name}</h2>
           <p className='text-sm'>{session?.user.email}</p>
           <p className='font-medium text-sm'>Level 1</p>
           <Progress />
        </div>
        </div>
        <div>
            <Button
             
            >
                Start Practice
            </Button>
        </div>
    </Card>
  )
}
