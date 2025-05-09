import { create } from "zustand"
import * as mediasoupClient from 'mediasoup-client';
import { useSocketStore } from "./useSocketStore";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMediaStore } from "./useMedia";




type MediasoupProducerState = {
    device: mediasoupClient.types.Device | null
    routerRtpCapabilities: mediasoupClient.types.RtpCapabilities | null
    joined : boolean
    error: string
    sendTransport: mediasoupClient.types.Transport | null
    producers: {
      audio: mediasoupClient.types.Producer | null
    }
    recvTransport: mediasoupClient.types.Transport | null
    remoteStream: MediaStream | null
    turn_config: RTCIceServer[] | null
    sessionCompleted: boolean
    

    setDevice: () => Promise<mediasoupClient.types.Device>
    joinRoom: (roomId: string, userId: string) => Promise<void>
    getDevice: () => Promise<mediasoupClient.types.Device>
    createSendTransport: (roomId: string) => Promise<void>
    startProducing: (localstream: MediaStream) => Promise<void>
    createRecvTransport: (roomId: string, device: mediasoupClient.types.Device) => Promise<{ success: boolean; error?: string }>;
    startConsuming: (device: mediasoupClient.types.Device, roomId:string) => Promise<void>;
    exitRoom: (roomId: string, router: AppRouterInstance) => Promise<void>
    updateTurnConfig: (turn_config: RTCIceServer[]) => void;
    updateSession: (completed: boolean) => void
    
}

export const useMediasoupStore = create<MediasoupProducerState>((set, get) => ({
    device: null,
    routerRtpCapabilities: null,
    joined: false,
    sendTransport: null,
    error: "",
    producers: {
      audio: null,
    },
    remoteStream: null,
    recvTransport: null,
    turn_config: null,
    sessionCompleted: false,
  



    joinRoom: async(roomId, userId ) => {
      const socket = useSocketStore.getState().socket;

      if (!socket || !socket.connected) {
          console.error("Socket is not connected. Cannot join room.");
          set({ error: "Socket is not connected" });
          return;
      }
        try {
          console.log("Emitting joinRoom with:", { roomId, userId });
            const { routerRtpCap } = await socket.emitWithAck("joinRoom", { roomId, userId })
            
            set({ joined: true})
            set({ routerRtpCapabilities: routerRtpCap})
        } catch (error){
            throw new Error(`[Failed to load device]: ${(error as Error).message}`);
        }
    },

    setDevice: async() => {
              const { routerRtpCapabilities } = get()

              if(!routerRtpCapabilities) {
                throw new Error("Router Rtp Capabilities not loaded")
              }


              try {
                const newDevice = new mediasoupClient.Device();
                await newDevice.load({ routerRtpCapabilities });
                set({ device: newDevice });
                return newDevice
              } catch (error) {
                console.error("Failed to load device", error)
                set({ error: "Failed to load device please try again later"})
                throw new Error(`Failed to load device: ${(error as Error).message}`);
              }
    },

    startProducing: async (localstream) => {
            const { sendTransport } = get()
            if (!sendTransport || !localstream) {
                throw new Error('Transports or media not initialized');
            }
    
            try {
                const audioTrack = localstream.getAudioTracks()[0];
                console.log(audioTrack)

                const audioProducer = audioTrack
                  ? await sendTransport.produce({ track: audioTrack })
                  : null;

                set({ producers: 
                    { 
                        audio: audioProducer, 
                    }
                });
    
              } catch (error) {
                console.error(`[Failed to start stream]: ${(error as Error).message}`);
                set({ error: "Failed to start media "})
                throw new Error(`[Failed to start stream]: ${(error as Error).message}`);
              }
    },

    startConsuming: async (device, roomId) => {
      const socket = useSocketStore.getState().socket;

      if (!socket || !socket.connected) {
          console.error("Socket is not connected. Cannot join room.");
          set({ error: "Socket is not connected" });
          return;
      }
   
      const { recvTransport } = get();
      if (!recvTransport) {
        throw new Error('Receive transport not initialized');
      }
      if (!device || !device.loaded) {
        throw new Error("Mediasoup device is not loaded.");
      }
      try {
        
        const response = await socket.emitWithAck('consume-media', {
          roomId,
          rtpCapabilities: device.rtpCapabilities,
        });
        const { consumerParams } = response;
        

        if (typeof consumerParams === "string") {
          if (consumerParams === "noProducer") {
            console.log("There is no producer set up to consume");
            throw new Error("No producer available");
          } else if (consumerParams === "cannotConsume") {
            console.log("rtpCapabilities failed. Cannot consume");
            throw new Error("Cannot consume producer");
          }
        }
        
        console.log("Consumer params:", consumerParams);
        
        
        const consumer = await recvTransport.consume({
          producerId: consumerParams.producerId,
          id: consumerParams.id,
          kind: consumerParams.kind,
          rtpParameters: consumerParams.rtpParameters,
        });

        console.log("🎧 Consumer created:", consumer);
        
        
        consumer.track.addEventListener("ended", () => {
          console.log("Remote track has ended");
        });
        consumer.track.onmute = () => {
          console.log("Remote track muted");
        };
        consumer.track.onunmute = () => {
          console.log("Remote track unmuted");
        };

        const newRemoteStream = new MediaStream([consumer.track]);
        
        await socket.emitWithAck("unpauseConsumer", { roomId });
        
        
        consumer.resume()

        set({ remoteStream: newRemoteStream });
        
      } catch (error) {
        throw new Error(`Failed to start consuming: ${(error as Error).message}`);
      }
    },

    createSendTransport: async(roomId) => {
      const socket = useSocketStore.getState().socket; // Access the socket instance

      if (!socket || !socket.connected) {
          console.error("Socket is not connected. Cannot join room.");
          set({ error: "Socket is not connected" });
          return;
      }
        try {
            const { getDevice, turn_config } = get()

            if(!turn_config) {
              throw new Error("TURN CONFIG IS SET")
            }

            const device = await getDevice()

            const { clientTransportParams } = await socket.emitWithAck('createProducerTransport', {
              roomId,
            });

            const transport = device.createSendTransport({
              id: clientTransportParams.id,
              iceParameters: clientTransportParams.iceParameters,
              iceCandidates: clientTransportParams.iceCandidates,
              dtlsParameters: clientTransportParams.dtlsParameters,
              iceServers: turn_config,
              iceTransportPolicy: 'all'
            });
           
            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {

              try {
                console.log("Send", dtlsParameters)
                const response = await socket.emitWithAck('connect-producer-transport', {
                  roomId,
                  dtlsParameters,
                });

                if (response.success) {
                  callback();
                } else {
                  errback(new Error('Failed to connect producer transport on server side'));
                }

                set({sendTransport: transport})

              } catch (error) {
                console.error('Error connecting producer transport:', error);
                errback(error as Error);
              }
            });

            transport.on(
              'produce',
              async ({ kind, rtpParameters }, callback, errback) => {

                try {
                  const { clientProducerId } = await socket.emitWithAck('start-produce', {
                    roomId,
                    kind,
                    rtpParameters,
                  });

                  callback({ id: clientProducerId });

                } catch (error) {

                  console.error('Error producing media:', error);
                  errback(error as Error);
                }
              }
            );

            set({sendTransport: transport})

          } catch (error) {
            console.error(`Failed to create send transport: ${(error as Error).message}`);
            set({ error: "Failed to process the request please try again later"})
            throw new Error(`Failed to create send transport: ${(error as Error).message}`);
          }
    },

    createRecvTransport: async (roomId, device) => {
      const socket = useSocketStore.getState().socket;
      const { turn_config } = get()

      if(!turn_config) {
        throw new Error("TURN IS NOT SET, RECEIVER")
      }

      if (!socket || !socket.connected) {
          console.error("Socket is not connected. Cannot join room.");
          set({ error: "Socket is not connected" });
      }
          try {
              if (!socket || !socket.connected) {
                  throw new Error("AI socket is not connected");
              }
      
              const { clientTransportParams } = await socket.emitWithAck('createConsumerTransport', { roomId });
      
              if (!clientTransportParams || !clientTransportParams.dtlsParameters) {
                  throw new Error("Invalid transport parameters received");
              }
    
      
              const transport = device.createRecvTransport({
                id: clientTransportParams.id,
                iceParameters: clientTransportParams.iceParameters,
                iceCandidates: clientTransportParams.iceCandidates,
                dtlsParameters: clientTransportParams.dtlsParameters,
                iceServers: turn_config,
                iceTransportPolicy: 'all'
              });
    
      
              transport.on('connectionstatechange', (state) => {
                  console.log('Consumer transport connection state change:', state);
              });
      
              transport.on('icegatheringstatechange', (state) => {
                  console.log('Consumer transport ICE gathering state change:', state);
              });
      
              transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                  try {
                      const response = await socket.emitWithAck('connect-consumer-transport', {
                          roomId,
                          dtlsParameters,
                      });
      
                      if (response.success) {
                          callback();
                      } else {
                          throw new Error('Failed to connect consumer transport on server side');
                      }
                  } catch (error) {
                      console.error('Error connecting consumer transport:', error);
                      errback(error instanceof Error ? error : new Error("Unknown error occurred"));
                  }
              });
      
              if (typeof set === "function") {
                  set({ recvTransport: transport });
              } else {
                  console.warn("set function is undefined, transport not stored.");
              }
      
              return { success: true };
      
          } catch (error) {
              console.error("Error creating receive transport:", error);
              if (typeof set === "function") {
                  set({ error: "Error creating receive transport. Please try again later." });
              }
              return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
          }
      },

    getDevice: async () => {
       try {
          const { device } = get()

          if(!device) {
            throw new Error("Device not loaded");
          }

          return device
       } catch (error) {
        console.error("Failed to get the device: ", error)
        throw error
       }
    },

    getSendTransport: async () => {
        try {
            const { sendTransport } = get()

            if(!sendTransport) {
               throw new Error("Send Transport not loaded")
            }

            return sendTransport
        } catch (error) {
            console.error("Failed to get send Transport")
            throw error
        }
    },

    exitRoom: async (roomId: string, router: AppRouterInstance) => {
      const socket = useSocketStore.getState().socket;
      const stopUserMedia = useMediaStore.getState().stopUserMedia
      const { sessionCompleted } = get()

      if (!socket || !socket.connected) {
          console.error("Socket is not connected. Cannot join room.");
          set({ error: "Socket is not connected" });
      }
      try {
        socket?.emit('exit-room', { roomId })
        stopUserMedia()
        useMediasoupStore.setState({ joined: false })
        if(!sessionCompleted) {
          router.replace('/practice')
        }
      } catch (error) {
        console.error("Failed to exit room")
        throw error
      }
    },


    updateTurnConfig: (turn_config: RTCIceServer[]) => set(() => ({ turn_config: turn_config})),
    updateSession: (completed: boolean) => set(() => ({ sessionCompleted: completed}))
}))

