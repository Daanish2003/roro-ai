"use client"
import { useSession } from '@/features/auth/auth-client'
import { useMediaStore } from '@/store/useMedia'

import { useMediasoupStore } from '@/store/useMediasoupStore'
import { usePromptStore } from '@/store/usePrompt'
import { Button } from '@roro-ai/ui/components/ui/button'
import { Sidebar, SidebarContent } from '@roro-ai/ui/components/ui/sidebar'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

export default function Join({ ...props }: React.ComponentProps<typeof Sidebar>) {
      const router = useRouter()
      const { joinRoom, createRecvTransport, createSendTransport, startProducing, startConsuming} = useMediasoupStore();
      const setupDevice = useMediasoupStore((state) => state.setDevice)
      const { localStream, } = useMediaStore()
      const params = useParams()
      const {data:session} = useSession()
      const { prompt } = usePromptStore()
      
      const roomId = params.roomId as string || ""

      if(!session) {
          return null
      }


      const JoinHandler = async () => {
        await joinRoom(roomId, session.user.id, session.user.name, prompt)
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
    <>
      <Sidebar {...props} collapsible='offcanvas' side='right' className='w-80 border-l-2'>
        <SidebarContent
        className='flex justify-center items-center bg-background'
        >
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
        </SidebarContent>
      </Sidebar>
    </>
  )
}
