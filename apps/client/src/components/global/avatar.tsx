"use client"


import { useSession } from '@/features/auth/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@roro-ai/ui/components/ui/avatar'




export default function UserAvatar() {
  const { data: session} = useSession()

  if(!session) {
    return (
      <Avatar className="h-8 w-8 rounded-full border-primary">
          <AvatarFallback className="rounded-lg bg-primary">CN</AvatarFallback>
    </Avatar>
    )
  }

  return (
    <Avatar className="h-8 w-8 rounded-full border-primary">
          <AvatarImage src={session.user.image as string} alt={session.user.name} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
    </Avatar>
  )
}
