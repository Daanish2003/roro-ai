import { socket } from "@/lib/socket";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSocket(){
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [loading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const isMounted = useRef<boolean>(true)

    //TODO: Connect socket
    const connect = useCallback(() => {
        if (socket.connected) {
            setIsLoading(false)
            return;
        }

        setIsLoading(true)
        setError("")
        socket.connect()
    }, [])

    //TODO: Disconnect socket
    const disconnect = useCallback(() => {
        socket.disconnect();
      }, []);
    
    //TODO: handleConnect, handleDisconnect and handleError in useEffect
    useEffect(() => {
        isMounted.current = true;

        const handleConnect = () => {
            if(!isMounted.current) return;
            setIsConnected(true);
            setIsLoading(false);
            setError("")
        };

        const handleDisconnect = () => {
            if (!isMounted.current) return;
            setIsConnected(true)
        }

        const handleConnectError = (err: Error) => {
            if(!isMounted.current) return;
            setError(err.message);
            setIsLoading(false)
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError);

        return () => {
            isMounted.current = false;
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        }
    }, [])

    return {
        isConnected,
        loading,
        error,
        connect,
        disconnect,
    }
    }
