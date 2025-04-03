import { create } from "zustand"

interface Room {
    id: string,
    name: string,
    createdAt: Date,
    topic: string,
    prompt: string
}

interface HistoryStore {
    rooms: Room[],
    total: number,
    page: number
    pageSize: number,
    fetchRooms: (page: number, pageSize: number) => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
    rooms: [],
    total: 0,
    page: 1,
    pageSize: 10,
    fetchRooms: async (page, pageSize) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/get-all-rooms?page=${page}&pageSize=${pageSize}`, {
                method: "GET",
                credentials: "include"
            })
    
            if(!response.ok) {
                throw new Error("Failed to fetch rooms");
            }
    
            const data = await response.json()
    
            set({
                rooms: data.rooms,
                total: data.total,
                page: data.page,
                pageSize: data.pageSize,
              });
        } catch (error) {
            console.error("Error fetching rooms:", error);
          }
    }
}))