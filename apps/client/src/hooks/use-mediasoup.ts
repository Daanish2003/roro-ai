import { Consumer, Device, DtlsParameters, IceCandidate, IceParameters, Producer, RtpCapabilities, Transport } from 'mediasoup-client/lib/types'
import { useCallback, useRef, useState } from 'react'
import * as mediasoupClient from 'mediasoup-client'
import { socket } from '@/lib/socket'

type ProducerState = {
    audio: Producer | null
    video: Producer | null
}

export type TransportParams = {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
};

export default function useMediasoup(roomId: string) {
  const [localStream, setLocalStream ] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream ] = useState<MediaStream | null>(null)


  const [device, setDevice] = useState<Device | null>(null)
  const [sendTransport, setSendTransport] = useState<Transport | undefined>(undefined)
  const [recvTransport, setRecvTransport] = useState<Transport | undefined>(undefined)
  const [producers, setProducers] = useState<ProducerState>({ audio: null, video: null})


  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);


 
  const getUserMedia = useCallback(async () => {
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
        
        setLocalStream(stream)

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = new MediaStream([videoTrack]);
            localVideoRef.current.play().catch(console.error);
        }

        return { audioTrack, videoTrack };

    } catch (error) {
        throw new Error("[ Failed to get media stream ]:", error as Error)
    }
  }, [])


  const setupDevice = useCallback(async ( routerRtpCapabilities: RtpCapabilities) => {
    try {
        const newDevice = new mediasoupClient.Device()

        await newDevice.load({ routerRtpCapabilities })

        setDevice(newDevice)

    } catch (error) {
        throw new Error ("[ Failed to load device ]:", error as Error )
    }
  }, [])

  
  const createSendTransport = useCallback(async () => {
    if (!device) throw new Error('Device not initialized');

    try {
      const { transportOptions } = await socket.emitWithAck('create-producer-transport', { roomId });
      const transport = device.createSendTransport(transportOptions);

      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck('connect-producer-transport', {
            roomId,
            dtlsParameters: JSON.parse(JSON.stringify(dtlsParameters))
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      });

      transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const { producerId } = await socket.emitWithAck('start-produce', {
            roomId,
            kind,
            rtpParameters: JSON.parse(JSON.stringify(rtpParameters))
          });
          callback({ id: producerId });
        } catch (error) {
          errback(error as Error);
        }
      });

      setSendTransport(transport);
      return transport;
    } catch (error) {
      throw new Error(`Failed to create send transport: ${error}`);
    }
  }, [device, roomId]);


  const createRecvTransport = useCallback(async () => {
    if (!device) throw new Error('Device not initialized');

    try {
      const { transportOptions } = await socket.emitWithAck('create-consumer-transport', { roomId });
      const transport = device.createRecvTransport(transportOptions);

      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck('connect-consumer-transport', {
            roomId,
            dtlsParameters: JSON.parse(JSON.stringify(dtlsParameters))
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      });

      setRecvTransport(transport);
      return transport;
    } catch (error) {
      throw new Error(`Failed to create receive transport: ${error}`);
    }
  }, [device, roomId]);

  const startProducing = useCallback(async () => {
    if (!sendTransport || !localStream) throw new Error('Transports or media not initialized');

    try {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      const audioProducer = audioTrack ? await sendTransport.produce({ track: audioTrack }) : null;
      const videoProducer = videoTrack ? await sendTransport.produce({ track: videoTrack }) : null;

      setProducers({ audio: audioProducer, video: videoProducer });
    } catch (error) {
      throw new Error(`Failed to start producing: ${error}`);
    }
  }, [sendTransport, localStream]);

  const startConsuming = useCallback(async () => {
    if (!recvTransport || !device) throw new Error('Receive transport not initialized');

    try {
      const { producers } = await socket.emitWithAck('get-producers', { roomId });
      
      const consumers: Consumer[] = [];
      const remoteStream = new MediaStream();

      for (const producerId of producers) {
        const { consumerParameters } = await socket.emitWithAck('consume-media', {
          roomId,
          producerId,
          rtpCapabilities: device.rtpCapabilities
        });

        const consumer = await recvTransport.consume({
          id: consumerParameters.id,
          producerId: consumerParameters.producerId,
          kind: consumerParameters.kind,
          rtpParameters: consumerParameters.rtpParameters
        });

        consumers.push(consumer);
        remoteStream.addTrack(consumer.track);
      }

      setRemoteStream(remoteStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(console.error);
      }

      // Resume all consumers after 1 second
      setTimeout(async () => {
        for (const consumer of consumers) {
          await socket.emitWithAck('resume-consumer', {
            roomId,
            consumerId: consumer.id
          });
        }
      }, 1000);
    } catch (error) {
      throw new Error(`Failed to start consuming: ${error}`);
    }
  }, [recvTransport, device, roomId]);

  const cleanup = useCallback(async () => {
    try {
      if (producers.audio) {
        producers.audio.close();
        await socket.emitWithAck('stop-produce', { roomId, kind: 'audio' });
      }
      if (producers.video) {
        producers.video.close();
        await socket.emitWithAck('stop-produce', { roomId, kind: 'video' });
      }

      if (sendTransport) {
        sendTransport.close();
        await socket.emitWithAck('close-producer-transport', { roomId });
      }
      if (recvTransport) {
        recvTransport.close();
        await socket.emitWithAck('close-consumer-transport', { roomId });
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      setProducers({ audio: null, video: null });
      setLocalStream(null);
      setRemoteStream(null);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, [producers, sendTransport, recvTransport, localStream, roomId]);



  return {
    // Refs
    localVideoRef,
    remoteVideoRef,

    // State
    localStream,
    remoteStream,
    producers,

    // Methods
    getUserMedia,
    setupDevice,
    createSendTransport,
    createRecvTransport,
    startProducing,
    startConsuming,
    cleanup
  };


}
