"use client"

import { useSession } from '@/features/auth/auth-client'
import { useMediaStore } from '@/store/useMedia'
import { useRoomStore } from '@/store/useRoomStore'
import { Button } from '@roro-ai/ui/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function JoinButton() {
  const router = useRouter()
  const params = useParams()
  const { data } = useSession()
  const { getUserMedia } = useMediaStore()
  const [ready, setReady] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const { joinHandler, exitHandler } = useRoomStore()

  const roomId = (params.roomId as string) || ""

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoading(true)
        await getUserMedia()
        setReady(true)
      } catch (err) {
        console.log(err)
        setReady(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [getUserMedia])

  const retryPermissions = async () => {
    try {
      setLoading(true)
      await getUserMedia()
      setReady(true)
    } catch (err) {
      console.log(err)
      setReady(false)
    } finally {
      setLoading(false)
    }
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-4 items-center">
      {loading ? (
        <div className="text-sm text-zinc-400 animate-pulse">
          Checking media permissions...
        </div>
      ) : !ready ? (
        <div className="text-sm text-red-500">
          Media permissions not granted. Please allow access to camera and microphone.
        </div>
      ) : null}

      <div className="flex w-full gap-2 justify-center">
        <Button
          variant="default"
          size="lg"
          onClick={() => joinHandler({ roomId, userId: data.user.id })}
          disabled={!ready}
        >
          Join
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          onClick={() => exitHandler(router)}
        >
          Exit
        </Button>
        {!loading && !ready && (
          <Button
            variant="secondary"
            size="lg"
            onClick={retryPermissions}
          >
            Retry Permission
          </Button>
        )}
      </div>
    </div>
  )
}
