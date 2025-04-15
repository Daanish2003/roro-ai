import { create } from "zustand"
import { useMediasoupStore } from "./useMediasoupStore"
import { useMediaStore } from "./useMedia"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

type RoomState = {
    joinHandler: ({roomId, userId}: {roomId: string, userId: string}) => Promise<void>
    exitHandler: (router: AppRouterInstance) => void
}

export const useRoomStore = create<RoomState>(() => ({

    joinHandler: async ({ 
        roomId, 
        userId,
    }: {
        roomId: string,
        userId: string
    }) => {
        const { joinRoom, createRecvTransport, createSendTransport, startProducing, startConsuming, setDevice } = useMediasoupStore.getState()
        const { localStream } = useMediaStore.getState()
        await joinRoom(roomId, userId)
        const device = await setDevice()
        const response = await createRecvTransport(roomId, device)
        if (response.success) {
          await createSendTransport(roomId)
    
        if (!localStream) return
        console.log(localStream)
        await startProducing(localStream)
        await startConsuming(device, roomId)
        }
    },

    exitHandler: (router: AppRouterInstance) => {
        const { stopUserMedia } = useMediaStore.getState()
        stopUserMedia()
        useMediasoupStore.setState({ joined: false })
        router.replace("/practice")
      }

}))