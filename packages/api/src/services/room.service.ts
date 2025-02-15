import { prisma } from "@roro-ai/database/client"


export const createRoomService = async (
    {
        userId, 
        roomName, 
        username,
        prompt
    }: {
        userId: string, 
        roomName: string, 
        username: string,
        prompt: string
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
                prompt
            }
        })

        return room

    } catch (error) {
       console.log("Create Room Error:", error)
       throw new Error("Failed to create room")
    }
}

