import {
  Device,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  Producer,
  RtpCapabilities,
  Transport,
} from 'mediasoup-client/lib/types';
import { useCallback, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { AiSocket, socket } from '@/lib/socket';

export type TransportParams = {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
};

type ProducerState = {
  audio: Producer | null;
};

export default function useMediasoup(roomId: string, userId: string, username: string) {
  /*** Local State ***/
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isRoomJoinLoading, setIsRoomJoinLoading] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string>('');
  const [media, setMedia] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [sendTransport, setSendTransport] = useState<Transport | undefined>(undefined);
  const [recvTransport, setRecvTransport] = useState<Transport | undefined>(undefined);
  const [producers, setProducers] = useState<ProducerState>({ audio: null });

  // Refs to local and remote video elements.
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  /*** 1. Media Acquisition & Device Setup ***/
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          autoGainControl: true,
          echoCancellation: true,
          sampleRate: 16000,
        },
        video: true,
      });
      setLocalStream(stream);
      const [videoTrack] = stream.getVideoTracks();
      if (localVideoRef.current && videoTrack) {
        localVideoRef.current.srcObject = new MediaStream([videoTrack]);
        localVideoRef.current.play().catch(console.error);
      }
      setMedia(true);
    } catch (error) {
      throw new Error(`[Failed to get media stream]: ${(error as Error).message}`);
    }
  }, []);

  const setupDevice = useCallback(
    async (routerRtpCapabilities: RtpCapabilities): Promise<Device> => {
      if (!routerRtpCapabilities) {
        throw new Error('Missing router RTP capabilities');
      }
      try {
        const newDevice = new mediasoupClient.Device();
        await newDevice.load({ routerRtpCapabilities });
        setDevice(newDevice);
        return newDevice;
      } catch (error) {
        throw new Error(`[Failed to load device]: ${(error as Error).message}`);
      }
    },
    []
  );

  /*** 2. Transport Creation & Connection ***/
  const createSendTransport = useCallback(
    async (device: Device): Promise<Transport> => {
      try {
        const { clientTransportParams } = await socket.emitWithAck('createProducerTransport', {
          roomId,
          type: 'producer',
        });
        const transport = device.createSendTransport(clientTransportParams);
        // Set up transport event handlers.
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            const response = await socket.emitWithAck('connect-producer-transport', {
              roomId,
              type: 'producer',
              dtlsParameters,
            });
            if (response.success) {
              callback();
            } else {
              errback(new Error('Failed to connect producer transport on server side'));
            }
          } catch (error) {
            console.error('Error connecting producer transport:', error);
            errback(error as Error);
          }
        });
        transport.on(
          'produce',
          async ({ kind, rtpParameters }, callback, errback) => {
            try {
              const { id } = await socket.emitWithAck('start-produce', {
                roomId,
                kind,
                rtpParameters,
              });
              callback({ id });
            } catch (error) {
              console.error('Error producing media:', error);
              errback(error as Error);
            }
          }
        );
        setSendTransport(transport);
        return transport;
      } catch (error) {
        throw new Error(`Failed to create send transport: ${(error as Error).message}`);
      }
    },
    [roomId]
  );

  const createPlainTransport = useCallback(async() => {
    try {
      const plainTransportParams = await socket.emitWithAck("create-plain-transport", {
         roomId
      })

      return plainTransportParams
    } catch (error) {
      throw new Error("Failed to create Plain Transport", error as Error)
    }
  }, [roomId])

  const createAiPlainTransport = useCallback(async() => {
    try {
      const plainTransportParams = await AiSocket.emitWithAck("create-plain-transport", {
         roomId
      })

      return plainTransportParams
    } catch (error) {
      throw new Error("Failed to create Plain Transport", error as Error)
    }
  }, [roomId])

  const connectPlainTransport = useCallback(async(plainParams : { ip: string, port: number, rtcpPort: number | undefined}) => {
    try {
      const response = await AiSocket.emitWithAck("connect-plain-transport", {
        ip: plainParams.ip,
        port: plainParams.port,
        rtcpPort: plainParams.rtcpPort,
        roomId
      })

      if(response.success !== true) {
        console.log("Failed to connect transport")
      }

    } catch (error) {
      throw new Error("Failed to connect plain transport", error as Error)
    }
  }, [roomId])

  const createRecvTransport = useCallback(
    async (device: Device): Promise<Transport> => {
      try {
        const { clientTransportParams } = await AiSocket.emitWithAck('createConsumerTransport', {
          roomId,
        });
        const transport = device.createRecvTransport(clientTransportParams);
        

        transport.on('connectionstatechange', (state) => {
          console.log('Consumer transport connection state change:', state);
        });

        transport.on('icegatheringstatechange', (state) => {
          console.log('Consumer transport ICE gathering state change:', state);
        });

        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            const response = await AiSocket.emitWithAck('connect-consumer-transport', {
              roomId,
              dtlsParameters,
            });
            if (response.success) {
              callback();
            } else {
              errback(new Error('Failed to connect consumer transport on server side'));
            }
          } catch (error) {
            console.error('Error connecting consumer transport:', error);
            errback(error as Error);
          }
        });
        setRecvTransport(transport);
        return transport;
      } catch (error) {
        throw new Error(`Failed to create receive transport: ${(error as Error).message}`);
      }
    },
    [roomId]
  );

  /*** 3. Production & Consumption ***/
  const startProducing = useCallback(
    async (transport: Transport) => {
      if (!transport || !localStream) {
        throw new Error('Transports or media not initialized');
      }
      try {
        const audioTrack = localStream.getAudioTracks()[0];

        const audioProducer = audioTrack
          ? await transport.produce({ track: audioTrack })
          : null;


        setProducers({ audio: audioProducer });
      } catch (error) {
        throw new Error(`Failed to start producing: ${(error as Error).message}`);
      }
    },
    [localStream]
  );

  const startAiProducing = useCallback(async () => {
      try {
         await AiSocket.emitWithAck("start-ai-produce", {roomId})
      } catch (error) {
        throw new Error(`Failed to start Ai producing: ${(error as Error).message}`);
      }

  },[roomId]);

  const startConsuming = useCallback(
    async (transport: Transport, device: Device) => {
      if (!transport) {
        throw new Error('Receive transport not initialized');
      }
      try {
        const { consumerParams } = await AiSocket.emitWithAck('consume-media', {
          roomId,
          rtpCapabilities: device.rtpCapabilities,
        });

        console.log(consumerParams)

        const consumer = await transport.consume({
          id: consumerParams.id,
          producerId: consumerParams.producerId,
          kind: consumerParams.kind,
          rtpParameters: consumerParams.rtpParameters,
        });
        
        const newRemoteStream = new MediaStream();
        newRemoteStream.addTrack(consumer.track);
      
        consumer.track.addEventListener('ended', () => {
          console.log('Remote track has ended');
        });
        consumer.track.onmute = () => {
          console.log('Remote track muted');
        };
        consumer.track.onunmute = () => {
          console.log('Remote track unmuted');
        };

        setRemoteStream(newRemoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = newRemoteStream;
          remoteVideoRef.current.play().catch(console.error);
        }
      } catch (error) {
        throw new Error(`Failed to start consuming: ${(error as Error).message}`);
      }
    },
    [roomId]
  );

  /*** 4. Room Joining & Cleanup ***/
  const joinRoom = useCallback(async () => {
    try {
      setIsRoomJoinLoading(true);
      setRoomError('');
      const response = await socket.emitWithAck('joinRoom', { roomId, userId, username });
      const AiResponse = await AiSocket.emitWithAck('joinRoom', { roomId })

      if (!response.success) {
        setRoomError('Failed to join room');
        setIsRoomJoinLoading(false);
        return { success: false };
      }

      if(!AiResponse.success) {
         console.log("Failed to join room")
      }
      setIsJoined(true);
      return { success: true, routerRtpCapabilities: response.routerRtpCap };
    } catch (error) {

      console.error('Failed to join room:', error);
      setRoomError('Failed to join room');
      return { success: false };

    } finally {
      setIsRoomJoinLoading(false);
    }
  }, [roomId, userId, username]);

  const cleanup = useCallback(() => {
    producers.audio?.close();
    sendTransport?.close();
    recvTransport?.close();
    setLocalStream(null);
    setRemoteStream(null);
    setProducers({ audio: null });
  }, [sendTransport, recvTransport, producers]);

  const initializeRoom = async () => {
    try {
      const joinResponse = await joinRoom();
      if (!joinResponse.success) {
        setRoomError('Room join failed.');
        return;
      }
      if (!media) {
        await getUserMedia();
      }
      const loadedDevice = await setupDevice(joinResponse.routerRtpCapabilities);
      const sendT = await createSendTransport(loadedDevice);

      const plainParams = await createPlainTransport()
      await createAiPlainTransport()

      await connectPlainTransport(plainParams)

      const recvT = await createRecvTransport(loadedDevice);
      
      if (!sendT || !recvT) {
        setRoomError('Failed to create transports.');
        return;
      }

      await startProducing(sendT);
      await startAiProducing()
      await startConsuming(recvT, loadedDevice);
    } catch (error) {
      console.error('Failed to initialize room:', error);
      setRoomError(`Failed to initialize room: ${(error as Error).message}`);
    }
  };

  return {
    // State
    isJoined,
    roomError,
    isRoomJoinLoading,
    media,
    localStream,
    remoteStream,
    producers,
    device,
    // Refs
    localVideoRef,
    remoteVideoRef,
    // Methods
    getUserMedia,
    setupDevice,
    createSendTransport,
    createRecvTransport,
    startProducing,
    startConsuming,
    cleanup,
    initializeRoom,
  };
}
