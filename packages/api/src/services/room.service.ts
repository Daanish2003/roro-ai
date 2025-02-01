import { prisma } from "@roro-ai/database/client"


export const createRoomService = async (
    {
        userId, 
        roomName, 
        username
    }: {
        userId: string, 
        roomName: string, 
        username: string
    }) => {
    try {
        const room = await prisma.room.create({
            select: {
                id: true,
                name: true,
                username: true,
                userId: true,
            },
            data: {
                name: roomName,
                username, 
                userId,
            }
        })

        return room

    } catch (error) {
       throw new Error("Failed to create room", error as Error)
    }
}

