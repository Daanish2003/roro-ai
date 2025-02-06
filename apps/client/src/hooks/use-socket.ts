import { socket, AiSocket } from "@/lib/socket";
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSocket() {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const isMounted = useRef<boolean>(true);

    const connect = useCallback(() => {
        if (socket.connected && AiSocket.connected) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        socket.connect();
    }, []);

    const disconnect = useCallback(() => {
        socket.disconnect();
    }, []);

    useEffect(() => {
        isMounted.current = true;

        const handleConnect = () => {
            if (!isMounted.current) return;
            setIsConnected(socket.connected);
            setLoading(false);
            setError("");
        };

        const handleDisconnect = () => {
            if (!isMounted.current) return;
            setIsConnected(false);
        };

        const handleConnectError = (err: Error) => {
            if (!isMounted.current) return;
            setLoading(false);
            setError(err.message);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);


        return () => {
            isMounted.current = false;
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);

        };
    }, []);

    return {
        isConnected,
        loading,
        error,
        connect,
        disconnect,
    };
}