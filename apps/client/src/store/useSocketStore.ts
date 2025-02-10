import { AiSocket, socket } from "@/lib/socket";
import { create } from "zustand"

type SocketState = {
    isConnected: boolean;
    loading: boolean;
    error: string;
    connect: () => void
    disconnect: () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
    isConnected: false,
    loading: false,
    error: "",

    connect: () => {
        if(socket.connected && AiSocket.connected) {
            set({loading: false});
            return
        }

        set({loading: true, error: ""});

        socket.connect()
        AiSocket.connect()

        const handleConnect = () => set({ isConnected: true, loading:false, error: ""});
        const handleDisconnect = () => set({ isConnected: false });
        const handleConnectError = (err: Error) => set({ loading: false, error: err.message });

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        AiSocket.on("connect", handleConnect);
        AiSocket.on("disconnect", handleDisconnect);
        AiSocket.on("connect_error", handleConnectError);
    },

    disconnect: () => {
        socket.disconnect();
        AiSocket.disconnect();
        set({ isConnected: false });
    }
}))