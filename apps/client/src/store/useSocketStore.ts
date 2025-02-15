import { socket } from "@/lib/socket";
import { create } from "zustand"

type SocketState = {
    isConnected: boolean;
    loading: boolean;
    error: string;
    connect: () => void
    disconnect: () => void
}

export const useSocketStore = create<SocketState>((set) => ({
    isConnected: false,
    loading: false,
    error: "",

    connect: () => {
        if(socket.connected) {
            set({loading: false});
            return
        }

        set({loading: true, error: ""});

        socket.connect()

        const handleConnect = () => set({ isConnected: true, loading:false, error: ""});
        const handleDisconnect = () => set({ isConnected: false });
        const handleConnectError = (err: Error) => set({ loading: false, error: err.message });

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
    },

    disconnect: () => {
        socket.disconnect();
        set({ isConnected: false });
    }
}))