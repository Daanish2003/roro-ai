import { useCallback, useRef, useState } from "react";

export function useSocket(){
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [isJoined, setIsJoined] = useState<boolean>(false)
    const [loading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const isMounted = useRef<boolean>(true)

    const handleSocketConnection = useCallback(async () => {
       
    },[])
}