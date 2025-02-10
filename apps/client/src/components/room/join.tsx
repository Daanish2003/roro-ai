import { useSession } from '@/lib/auth-client'
import { useMediaStore } from '@/store/useMedia'
import { useMediasoupConsumerStore } from '@/store/useMediasoupConsumerStore'
import { useMediasoupProducerStore } from '@/store/useMediasoupProducerStore'
import { Button } from '@roro-ai/ui/components/ui/button'
import { useParams } from 'next/navigation'
import React from 'react'

export default function Join() {
      const joinRoom = useMediasoupProducerStore((state) => state.joinRoom)
      const createSendTransport = useMediasoupProducerStore((state) => state.createSendTransport)
      const createProducerPlainTransport = useMediasoupProducerStore((state) => state.createProducerPlainTransport)
      const setupDevice = useMediasoupProducerStore((state) => state.setDevice)
      const startProducing = useMediasoupProducerStore((state) => state.startProducing)
      const consumerJoinRoom = useMediasoupConsumerStore((state) => state.consumerJoinRoom)
      const createRecvTransport = useMediasoupConsumerStore((state) => state.createRecvTransport)
      const createConsumerPlainTransport = useMediasoupConsumerStore((state) => state.createConsumerPlainTransport)
      const connectProducerPlainTransport = useMediasoupProducerStore((state) => state.connectProducerPlainTransport)
      const startConsumingProducer = useMediasoupConsumerStore((state) => state.startConsumerProducing)
      const startConsuming = useMediasoupConsumerStore((state) => state.startConsuming)
      const forwardMedia = useMediasoupProducerStore((state) => state.forwardMedia)
      const localStream = useMediaStore((state) => state.localStream)
      const params = useParams()
      const {data:session} = useSession()
      
      const roomId = params.roomId as string || ""

      if(!session) {
          return null
      }

      const userId = session.user.id
      const username = session.user.name


      const JoinHandler = async () => {
        await joinRoom(roomId, userId, username)
        await consumerJoinRoom(roomId)
        const device = await setupDevice()
        const response = await createRecvTransport(roomId, device)
        if (response.success) {
          await createSendTransport(roomId)
        await createProducerPlainTransport(roomId)
        const plainTransportParams = await createConsumerPlainTransport(roomId)
        await connectProducerPlainTransport(plainTransportParams, roomId)
    
        if (!localStream) return;

        await startProducing(localStream)
        const rtpParameters = await forwardMedia(roomId)
        console.log("forward-2", rtpParameters)
        await startConsumingProducer(roomId,rtpParameters)
        await startConsuming(device, roomId)
        }
        
      }

  return (
    <div className="bg-card lg:w-1/4 flex flex-col items-center justify-center rounded-2xl border p-4 gap-y-4">
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
            >
            Exit
            </Button>
           </div>
          <div>
        </div>
      </div>
  )
}
