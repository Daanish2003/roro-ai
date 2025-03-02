import { prisma } from "@roro-ai/database/client"


export const createRoomService = async (
    {
        userId, 
        roomName, 
        username,
        prompt,
        topic
    }: {
        userId: string, 
        roomName: string, 
        username: string,
        prompt: string,
        topic: string
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
                prompt,
                topic
            }
        })

        return room

    } catch (error) {
       console.log("Create Room Error:", error)
       throw new Error("Failed to create room")
    }
}

export const getAllRoomsService = async (
    {
        userId,
        skip,
        take 
    } : {
        userId: string,
        skip: number,
        take: number
    }
) => {
    try {
        const rooms = await prisma.room.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                topic: true,
            },
            skip,
            take,
            where: {
                userId
            }
        })

        const total = await prisma.room.count()

        return {
            rooms,
            total
        }
    } catch (error) {
        console.log("Get All Room Error:", error)
        throw new Error("Failed to get all room")
     }
}

export const getRoomService = async (
    {
        userId,
        roomId 
    } : {
        userId: string,
        roomId: string
    }
) => {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId,
                userId,
            }
        })

        return room
    } catch (error) {
        console.log("Get Room Error:", error)
        throw new Error("Failed to get room")
     }
}

export const deleteRoomService = async (
    {
        userId,
        roomId 
    } : {
        userId: string,
        roomId: string
    }
) => {
    try {
        await prisma.room.delete({
            where: {
                id: roomId,
                userId,
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete Room Error:", error)
        throw new Error("Failed to delete room")
     }
}

export const deleteAllRoomService = async (
    {
        userId,
        roomId
    } : {
        userId: string,
        roomId: string[]
    }
) => {
    try {
        await prisma.room.deleteMany({
            where: {
              userId,
              id: {
                in: roomId
              }
            }
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Delete All Room Error:", error)
        throw new Error("Failed to delete all room")
     }
}

