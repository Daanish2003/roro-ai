"use client"
import { socket } from "@/lib/socket"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import * as mediasoupClient from "mediasoup-client"
import type { Producer, Transport } from "mediasoup-client/lib/types"
import { RemoveFormattingIcon } from "lucide-react"

export default function RoomPage() {
  const params = useParams()
  const roomId = params?.roomId as string
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null)
  const [sendTransport, setSendTransport] = useState<Transport | null>(null)
  const [recvTransport, setRecvTransport] = useState<Transport | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | undefined>(undefined)
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStream | undefined>(undefined)
  const [isRemoteMedia, setIsRemoteMedia] = useState<boolean>(false)
  const [producer, setProducer] = useState<Producer | null>(null)
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

    if (!device && !isJoined) return;

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

        if (!device) return;

        const sendTransport = device.createSendTransport(clientTransportParams)

        // console.log(sendTransport)

        setSendTransport(sendTransport)

        sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            const response = await socket.emitWithAck('connect-producer-transport', {
              roomId,
              dtlsParameters,
              type: 'producer',
            })

            console.log(response)
            if (response.success) {
              callback();
            }
          } catch (error) {
            errback(error as Error)
          }
        });

        sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
          try {
            const { id } = await socket.emitWithAck('start-produce', {
              roomId,
              kind,
              rtpParameters
            });

            console.log(id)

            callback({ id })
          } catch (error) {
            errback(error as Error)
          }
        });

        const produce = await sendTransport.produce({
          track: audioTrack,
        })

        setProducer(produce)

      } catch (error) {
        console.error("Creating Producer Error: ", error)
      }
    }

    const createConsumer = async () => {
      const { clientTransportParams } = await socket.emitWithAck('createConsumerTransport', {
        roomId,
        direction: 'recieve'
      })

      console.log(clientTransportParams)

      if (!device) return;

      const recvTransport = device.createRecvTransport(clientTransportParams)

      console.log(recvTransport)

      setRecvTransport(recvTransport)

      recvTransport.on('connectionstatechange', state => {
        console.log("....connection state change....")
        console.log(state)
      })

      recvTransport.on('icegatheringstatechange', state => {
        console.log("....ice gathering change....")
        console.log(state)
      })

      recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          const resp = await socket.emitWithAck('connect-consumer-transport',
            {
              dtlsParameters,
              roomId,
              type: "consumer"
            })

          console.log(resp)

          if (resp.success) {
            callback()
          }
        } catch (error) {
          errback(error as Error)
        }
      })
      
        const { consumerParams } = await socket.emitWithAck('consume-media', {
          rtpCapabilities: device.rtpCapabilities,
          roomId
        })

        console.log("consomuer:", consumerParams)

        if (consumerParams === "noProducer") {
          console.log("There is no producer set up to consume")
        } else if (consumerParams === "cannotConsume") {
          console.log("rtpCapabilities failed. Cannot consume")
        } else {
          const consumer = await recvTransport.consume(consumerParams)

          const { track } = consumer

          console.log(track)

          track.addEventListener("ended", () => {
            console.log("Track has ended")
          })

          track.onmute = (event) => {
            console.log("Track has muted")
          };

          track.onunmute = (event) => {
            console.log("Track has unmuted")
          };

          const remotetrack = new MediaStream([track])

          setRemoteAudioTrack(remotetrack)
          setIsRemoteMedia(true)
          console.log(remotetrack)
        }
      }

    const setup = async () => {
      await createProducer()
      await createConsumer()
    } 

    setup()
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
        <p>Remote Media status: {isRemoteMedia ? "connected" : "disconnect"}</p>
        <p>{JSON.stringify(RemoveFormattingIcon)}</p>
      </div>
    </div>
  )
}