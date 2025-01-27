"use client"
import { socket } from "@/lib/socket"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import * as mediasoupClient from "mediasoup-client"
import type { Transport } from "mediasoup-client/lib/types"

export default function RoomPage() {
  const params = useParams()
  const roomId = params?.roomId as string
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null)
  const [sendTransport, setSendTransport] = useState<Transport | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | undefined>(undefined)
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {

    const joinRoom = async (roomId: string) => {
      try {
        const response = await socket.emitWithAck('joinRoom', { roomId });

        if (response.success) {

          console.log(`Successfully joined room: ${roomId}`);

          const mediaDevice = new mediasoupClient.Device();
          await mediaDevice.load({ routerRtpCapabilities: response.routerRtpCap })

          setDevice(mediaDevice)
          setIsJoined(true)
          return true
        }
        console.error(`Failed to join room: ${roomId}`);
        return false;

      } catch (error) {
        console.error('Error joining room:', error);
        return false;
      }
    }



    const onConnect = async () => {
      setIsConnected(true)
      setConnectionError(null)
      joinRoom(roomId)
    }

    const onError = (error: Error) => {
      console.error("Socket connection error:", error)
      setConnectionError(error.message)
      setIsConnected(false)
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    // Attempt to connect
    socket.connect()

    // Add event listeners
    socket.on('connect', onConnect)
    socket.on('connect_error', onError)
    socket.on('disconnect', onDisconnect)

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect)
      socket.off('connect_error', onError)
      socket.off('disconnect', onDisconnect)
      socket.disconnect()
    }
  }, [roomId])

  useEffect(() => {

    if(!device && !isJoined) return;

      const createProducer = async () => {
        try {
          const localstream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 16000
    
            }
          })
    
          const audioTrack = localstream.getAudioTracks()[0]
    
          setLocalAudioTrack(audioTrack)
    
          const { clientTransportParams } = await socket.emitWithAck('createProducerTransport', {
            roomId,
            direction: 'send'
          })

          console.log(clientTransportParams)
    
          if(!device) return;
    
          const sendTransport = device.createSendTransport(clientTransportParams)
  
          // console.log(sendTransport)
    
          setSendTransport(sendTransport)
    
          sendTransport.on('connect', async({ dtlsParameters }, callback, errback) => {
            try {
              const response = await socket.emitWithAck('connect-producer-transport', {
                roomId,
                transportId: sendTransport.id,
                dtlsParameters
              })
    
              console.log(response)
              if (response.success) {
                callback();
              }
            } catch (error) {
              errback(error as Error)
            }
          });
    
          sendTransport.on('produce', async ({kind, rtpParameters}, callback, errback) => {
            try {
              const { producerId } = await socket.emitWithAck('start-produce', {
                roomId,
                transportId: sendTransport.id,
                kind,
                rtpParameters
              });
    
              callback({ id: producerId })
            } catch (error) {
              errback(error as Error)
            }
          });
    
          await sendTransport.produce({
            track: audioTrack,
          })
    
        } catch (error) {
          console.error("Creating Producer Error: ", error)
        }
    }

    createProducer()
  }, [device, isJoined, roomId])

    if (!roomId) {
      return null // Router will handle redirection
    }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
      <div className="space-y-2">
        <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        {connectionError && (
          <p className="text-red-500">Error: {connectionError}</p>
        )}
        <p>
          Room Status: {isJoined ? 'Joined' : 'Not Joined'}
        </p>
      </div>
    </div>
  )
}