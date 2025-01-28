import { Consumer, Device, Producer, RtpCapabilities, Transport } from 'mediasoup-client/lib/types'
import React, { useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'

type ProducerState = {
    audio: Producer | null
    video: Producer | null
}

export default function useMediasoup() {
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
  const [localStream, setLocalStream ] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream ] = useState<MediaStream | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [sendTransport, setSendTransport] = useState<Transport | null>(null)
  const [recvTransport, setRecvTransport] = useState<Transport | null>(null)
  const [producers, setproducer] = useState<ProducerState>({ audio: null, video: null})
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)


  //TODO: getUser media
  const getUserMedia = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                noiseSuppression: true,
                autoGainControl: true,
                echoCancellation: true,
                sampleRate: 16000
            },
            video: true,
        })

        const [audioTrack] = stream.getAudioTracks()
        const [videoTrack] = stream.getVideoTracks()

        setLocalAudioTrack(audioTrack)
        setLocalVideoTrack(audioTrack)
        setLocalStream(stream)

        if(videoRef.current) {
            videoRef.current.srcObject = new MediaStream([videoTrack])
            videoRef.current.play()
        }

    } catch (error) {
        throw new Error("[ Failed to get media stream ]:", error as Error)
    }
  }

  //TODO: setup device
  const setupDevice = async ( routerRtpCapabilities: RtpCapabilities) => {
    try {
        const mediaDevice = new mediasoupClient.Device()

        await mediaDevice.load({ routerRtpCapabilities })

        setDevice(device)

    } catch (error) {
        throw new Error ("[ Failed to load device ]:", error as Error )
    }
  }

  //TODO: create send Transport
  const createSendTransport = async () => {

  }

  //TODO: connect send Transport
  //TODO: produce
  //TODO: create receive Transport
  //TODO: connect receive Transport
  //TODO: consume

  return {
    getUserMedia,
    setupDevice
  }


}
