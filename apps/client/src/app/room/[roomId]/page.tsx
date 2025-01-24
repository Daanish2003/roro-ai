"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMediasoup } from "@/hooks/use-mediasoup";

export default function RoomPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.roomId as string | undefined;
    const { socket, isConnected } = useSocket();
    const { device, produce } = useMediasoup();
    const [isJoined, setIsJoined] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (!roomId) {
            router.replace("/dashboard/practice");
        }
    }, [roomId, router]);

    const handleStream = async () => {
        if (device && socket) {
            
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                await produce(mediaStream);
            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        }
    };

    const handleRoomJoin = useCallback(() => {
        if (socket && roomId) {
            socket.emit("joinRoom", { roomId }, (response: { success: boolean }) => {
                if (response.success) {
                    setIsJoined(true);
                    console.log(`Joined room: ${roomId}`);
                } else {
                    console.error("Failed to join the room.");
                }
            });
        }
    }, [socket, roomId]);

    const handleRoomLeave = () => {
        if (socket && roomId) {
            socket.emit("leaveRoom", { roomId });
            router.push("/");
        }
    };

    
    useEffect(() => {
        if (device && roomId) {
            handleRoomJoin();
        }
    }, [device, roomId, handleRoomJoin]);

    
    if (!roomId) {
        return <p className="text-red-500">Invalid room ID. Redirecting...</p>;
    }

  
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-4">Room ID: {roomId}</h1>

            <p>
                {isConnected ? (
                    isJoined ? (
                        <span className="text-green-500">You have joined the room successfully!</span>
                    ) : (
                        <span className="text-yellow-500">Joining the room...</span>
                    )
                ) : (
                    <span className="text-red-500">Connecting to the server...</span>
                )}
            </p>

            <Button onClick={handleStream} className="mt-6">
                Start Streaming
            </Button>

            {stream && (
                <video
                    autoPlay
                    muted
                    playsInline
                    ref={(video) => {
                        if (video && stream) {
                            video.srcObject = stream;
                        }
                    }}
                    className="mt-6 w-72 h-72 border border-gray-400"
                />
            )}

            <Button onClick={handleRoomLeave} className="mt-6">
                Leave Room
            </Button>
        </div>
    );
}
