import { socket } from "@/lib/socket";
import { useCallback, useRef, useState } from "react";

export function useSocket(){
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [loading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const isMounted = useRef<boolean>(true)

    //TODO: Connect socket
    //TODO: Disconnect socket
    //TODO: handleConnect, handleDisconnect and handleError in useEffect

    return () => {
        //TODO: return a states and functions
    }
    }
