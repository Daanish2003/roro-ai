"use client"
import { useParams } from 'next/navigation'
import React from 'react'

export default function RoomPage() {
    const params = useParams()
    const roomId = params?.roomId as string

  return (
    <div>{roomId}</div>
  )
}
