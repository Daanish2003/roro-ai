"use client"
import React from 'react'
import UserAvatar from '../global/avatar'
import { useSession } from '@/features/auth/auth-client'

export default function Profile() {
    const { data: session } = useSession()

    if(!session) {
        return null
    }

  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar />
        <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{session.user.name}</span>
            <span className="truncate text-xs">{session.user.email}</span>
        </div>
    </div>
  )
}
