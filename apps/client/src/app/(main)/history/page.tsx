"use client"

import PracticeButton from '@/components/dashboard/practice/practice-button'

import { useHistoryStore } from '@/features/history/store/history-store'
import React, { useEffect } from 'react'

export default function PracticePage() {
  const { rooms, fetchRooms, pageSize } = useHistoryStore()

  useEffect(() => {
    fetchRooms(1, pageSize)
  }, [fetchRooms, pageSize])

  return (
    <div className="container">
      <div className="mt-4">
            {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold text-center">No rooms available</h2>
          <p className="text-center text-muted-foreground">Create a new room to start practicing</p>
          <PracticeButton />
        </div>
      ) : (
        <></>
      )}
      </div>
    </div>
  )
}