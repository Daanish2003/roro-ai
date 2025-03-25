import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { getSession, token } from '@/features/auth/auth-client';

const URL = process.env.NEXT_PUBLIC_MEDIA_URL;

type SocketState = {
    socket: Socket | null;
    isConnected: boolean;
    loading: boolean;
    error: string;
    connect: () => void;
    disconnect: () => void;
};

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    loading: false,
    error: "",

    connect: async () => {
        const { socket, loading } = get();
    if (socket || loading) return; // Prevent duplicate connections

    set({ loading: true });

    const { data: session } = await getSession();

    const { data }= await token({
        fetchOptions: {
            headers: {
                "Authorization": `Bearer ${session?.session.token}`
            }
        }
    })

    if(!data) {
        throw new Error("data is null")
    }

    const newSocket: Socket = io(URL, {
        withCredentials: true,
        autoConnect: false,
        auth: { token: data.token }
    });

    set({ socket: newSocket, error: "" });

    newSocket.connect();

    newSocket.on("connect", () => set({ isConnected: true, loading: false, error: "" }));
    newSocket.on("disconnect", () => set({ isConnected: false }));
    newSocket.on("connect_error", (err: Error) => set({ loading: false, error: err.message }));
    },

    disconnect: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ isConnected: false, socket: null });
        }
    },
}));
