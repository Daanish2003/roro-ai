import UserAvatar from '@/components/global/avatar'
import { useSession } from '@/features/auth/auth-client'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@roro-ai/ui/components/ui/card'
import { Separator } from '@roro-ai/ui/components/ui/separator'
import React from 'react'
import { shortenDescription } from '../helper/shorternDescription'

export default function HistoryCard({title, description, time}: {title: string, description: string, time: Date}) {
    const { data } = useSession()

    const date = new Date(time);
    const shortDescription = shortenDescription(description, 100);
  return (
    <Card>
        <CardHeader>
            <CardTitle>
                {title}
            </CardTitle>
            <CardDescription>
                {shortDescription}
            </CardDescription>
        </CardHeader>
        <Separator orientation='horizontal' className='w-full'/>
        <CardFooter className='flex mt-4 gap-x-2'>
            <UserAvatar />
            <span>{data?.user.name}</span>
            <span className='text-muted-foreground text-sm'>
            {date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })}
            </span>
        </CardFooter>
    </Card>
  )
}
