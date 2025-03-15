import { useSession } from '@/lib/auth-client'
import { useMediaStore } from '@/store/useMedia'

import { useMediasoupStore } from '@/store/useMediasoupStore'
import { usePromptStore } from '@/store/usePrompt'
import { Button } from '@roro-ai/ui/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

export default function Join() {
      const router = useRouter()
      const joinRoom = useMediasoupStore((state) => state.joinRoom)
      const createSendTransport = useMediasoupStore((state) => state.createSendTransport)
      const setupDevice = useMediasoupStore((state) => state.setDevice)
      const startProducing = useMediasoupStore((state) => state.startProducing)
      const createRecvTransport = useMediasoupStore((state) => state.createRecvTransport)
      const startConsuming = useMediasoupStore((state) => state.startConsuming)
      const localStream = useMediaStore((state) => state.localStream)
      const params = useParams()
      const {data:session} = useSession()
      const { prompt } = usePromptStore()
      
      const roomId = params.roomId as string || ""

      if(!session) {
          return null
      }

      const userId = session.user.id
      const username = session.user.name


      const JoinHandler = async () => {
        await joinRoom(roomId, userId, username, prompt)
        const device = await setupDevice()
        const response = await createRecvTransport(roomId, device)
        if (response.success) {
          await createSendTransport(roomId)
    
        if (!localStream) return
        await startProducing(localStream)
        await startConsuming(device, roomId)
        }
        
      }

      const ExitHandler = async () => {
        router.replace("/dashboard/practice")
      }

  return (
    <div className="bg-background lg:w-1/4 flex flex-col items-center justify-center rounded-2xl border p-4 gap-y-4">
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to Join Session?</h2>
            <p className="text-muted-foreground text-sm">Room ID: {roomId}</p>
        </div>
        <div className="flex w-full gap-2 justify-center">
            <Button
               variant={"default"}
               size={"lg"}
               onClick={JoinHandler}
            >
            Join
            </Button>
            <Button
               variant={"outline"}
               size={"lg"}
               className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
               onClick={ExitHandler}
            >
            Exit
            </Button>
           </div>
          <div>
        </div>
      </div>
  )
}
