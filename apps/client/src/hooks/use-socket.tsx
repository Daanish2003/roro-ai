"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
  }

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({children}: {children: ReactNode}) => {
    const [socket, setSocket ] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const URL="http://localhost:5000"
        const socketInstance = io(URL, {
            withCredentials: true,
            autoConnect: false
        })

        socketInstance.connect()

        socketInstance.on('connect', () => {
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect()
        }

    }, [])

    return (
        <SocketContext.Provider value={ {socket, isConnected }}>
         {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => {
    const context =  useContext(SocketContext)

    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;

}