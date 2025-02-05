import {
  Consumer,
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
import { socket } from '@/lib/socket';

type ProducerState = {
  audio: Producer | null;
  video: Producer | null;
};

export type TransportParams = {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
};

export default function useMediasoup(roomId: string, userId: string) {
  // Local state
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isRoomJoinLoading, setIsRoomJoinLoading] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string>('');
  const [media, setMedia] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [device, setDevice] = useState<Device | null>(null);
  const [sendTransport, setSendTransport] = useState<Transport | undefined>(undefined);
  const [recvTransport, setRecvTransport] = useState<Transport | undefined>(undefined);
  const [producers, setProducers] = useState<ProducerState>({ audio: null, video: null });

  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

 
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
      const [videoTrack] = stream.getVideoTracks();

      setLocalStream(stream);

      if (localVideoRef.current && videoTrack) {
        localVideoRef.current.srcObject = new MediaStream([videoTrack]);
        localVideoRef.current.play().catch(console.error);
      }

      setMedia(true);
    } catch (error) {
      throw new Error(`[ Failed to get media stream ]: ${(error as Error).message}`);
    }
  }, []);

  
  const setupDevice = useCallback(async (routerRtpCapabilities: RtpCapabilities): Promise<Device> => {
    if (!routerRtpCapabilities) {
      throw new Error('Missing router RTP capabilities');
    }
    try {
      const newDevice = new mediasoupClient.Device();
      await newDevice.load({ routerRtpCapabilities });
      setDevice(newDevice);
      return newDevice;
    } catch (error) {
      throw new Error(`[ Failed to load device ]: ${(error as Error).message}`);
    }
  }, []);


  const createSendTransport = useCallback(async (device: Device): Promise<Transport> => {
    try {
      const data = await socket.emitWithAck('createProducerTransport', {
        roomId,
        userId,
      });

      console.log(data)

      const { id, iceParameters, iceCandidates,dtlsParameters } = data

      const transport = device.createSendTransport({ id, iceParameters, iceCandidates,dtlsParameters });


      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck('connect-producer-transport', {
            roomId,
            userId,
            dtlsParameters,
          });


            callback();

        } catch (error) {
          errback(error as Error);
        }
      });

      transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
          console.log(kind)
          const { id } = await socket.emitWithAck('start-produce', {
            roomId,
            kind,
            userId,
            rtpParameters,
          });
          callback({ id });
        } catch (error) {
          errback(error as Error);
        }
      });

      setSendTransport(transport);
      return transport;
    } catch (error) {
      throw new Error(`Failed to create send transport: ${(error as Error).message}`);
    }
  }, [roomId, userId]);


  const createRecvTransport = useCallback(async (device: Device): Promise<Transport> => {
    try {
      const data = await socket.emitWithAck('createConsumerTransport', {
        roomId,
        userId,
      });

      const { id, iceParameters, iceCandidates,dtlsParameters } = data

      const transport = device.createRecvTransport({ id, iceParameters, iceCandidates,dtlsParameters });

      transport.on('connectionstatechange', (state) =>{
        console.log("....connection state change....")
        console.log(state)
    })
      transport.on('icegatheringstatechange', (state) =>{
        console.log("....ice gathering change....")
        console.log(state)
    }) 

      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck('connect-consumer-transport', {
            roomId,
            userId,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      });

      console.log(transport)

      setRecvTransport(transport);
      return transport;
    } catch (error) {
      throw new Error(`Failed to create receive transport: ${(error as Error).message}`);
    }
  }, [roomId, userId]);

  const startProducing = useCallback(async (sendTransport: Transport) => {
    if (!sendTransport || !localStream) {
      throw new Error('Transports or media not initialized');
    }
    try {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      const audioProducer = audioTrack
        ? await sendTransport.produce({ track: audioTrack })
        : null;
      const videoProducer = videoTrack
        ? await sendTransport.produce({ track: videoTrack })
        : null;

      setProducers({ audio: audioProducer, video: videoProducer });
    } catch (error) {
      throw new Error(`Failed to start producing: ${(error as Error).message}`);
    }
  }, [localStream]);

  
  const startConsuming = useCallback(async (recvTransport: Transport, device: Device) => {
    if (!recvTransport || !device) {
      throw new Error('Receive transport not initialized');
    }
    try {
      const { producers: remoteProducers } = await socket.emitWithAck('get-producers', { roomId });
      const consumers: Consumer[] = [];
      const remoteStream = new MediaStream();

      for (const producerId of remoteProducers) {
        const { consumerParameters } = await socket.emitWithAck('consume-media', {
          roomId,
          producerId,
          rtpCapabilities: device.rtpCapabilities,
        });

        const consumer = await recvTransport.consume({
          id: consumerParameters.id,
          producerId: consumerParameters.producerId,
          kind: consumerParameters.kind,
          rtpParameters: consumerParameters.rtpParameters,
        });


        consumers.push(consumer);
        remoteStream.addTrack(consumer.track);

        consumer.track.addEventListener("ended", () => {
          console.log("Track has ended")
      });
      
        consumer.track.onmute = (event) => {
          console.log("Track has muted", event)
        };
        
        consumer.track.onunmute = (event) => {
          console.log("Track has unmuted", event)
        };
      }

      setRemoteStream(remoteStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(console.error);
      }


      setTimeout(async () => {
        for (const consumer of consumers) {
          await socket.emitWithAck('resume-consumer', {
            roomId,
            consumerId: consumer.id,
          });
        }
      }, 1000);
    } catch (error) {
      throw new Error(`Failed to start consuming: ${(error as Error).message}`);
    }
  }, [roomId]);

  // Join room and set RTP capabilities for the router.
  const joinRoom = useCallback(async () => {
    try {
      setIsRoomJoinLoading(true);
      setRoomError('');

      const response = await socket.emitWithAck('joinRoom', { roomId, userId });

      if (!response.success) {
        setRoomError('Failed to join Room');
        setIsRoomJoinLoading(false);
        return { success: false };
      }

      setIsJoined(true);
      
      return {
        success: true,
        routerRtpCapabilities: response.routerRtpCap

      };

    } catch (error) {
      console.error('Failed to join room:', error);
      setRoomError('Failed to join Room');
      return { success: false };
    } finally {
      setIsRoomJoinLoading(false);
    }
  }, [roomId, userId]);

  
  const cleanup = useCallback(() => {
    producers.audio?.close();
    producers.video?.close();
    sendTransport?.close();
    recvTransport?.close();
    setLocalStream(null);
    setRemoteStream(null);
    setProducers({ audio: null, video: null });
  }, [sendTransport, recvTransport, producers]);

  
    const initializeRoom = async () => {
      try {
        
        const joinResponse = await joinRoom();
        if (!joinResponse.success) return;

        
        if (!media) {
          await getUserMedia();
        }

        
        const loadedDevice = await setupDevice(joinResponse.routerRtpCapabilities);

        
        const sendT = await createSendTransport(loadedDevice);
        const recvT = await createRecvTransport(loadedDevice);
        if (!sendT || !recvT) {
          throw new Error('Failed to create transports');
        }

       
        await startProducing(sendT);
        await startConsuming(recvT, loadedDevice);
      } catch (error) {
        console.error('Failed to initialize room:', error);
        setRoomError('Failed to initialize room');
      }
    };

  return {
    isJoined,
    roomError,
    isRoomJoinLoading,
    // Refs
    localVideoRef,
    remoteVideoRef,
    // State
    localStream,
    remoteStream,
    producers,
    device,
    // booleans
    media,
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
