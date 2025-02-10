import { create } from "zustand"
import { socket } from "../lib/socket"
import * as mediasoupClient from 'mediasoup-client';



type MediasoupProducerState = {
    device: mediasoupClient.types.Device | null
    routerRtpCapabilities: mediasoupClient.types.RtpCapabilities | null
    joined : boolean
    error: string
    sendTransport: mediasoupClient.types.Transport | null
    producers: {
      audio: mediasoupClient.types.Producer | null
    }



    setDevice: () => Promise<mediasoupClient.types.Device>
    joinRoom: (roomId: string, userId: string, username: string) => Promise<void>
    getDevice: () => Promise<mediasoupClient.types.Device>
    forwardMedia: (roomId: string) => Promise<mediasoupClient.types.RtpParameters>
    createSendTransport: (roomId: string) => Promise<void>
    createProducerPlainTransport: (roomId: string) => Promise<{ip: string, port: number, rtcpPort: number }>
    startProducing: (localstream: MediaStream) => Promise<void>
    connectProducerPlainTransport: (
            plainTransportParams: { ip: string; port: number; rtcpPort?: number },
            roomId: string
    ) => Promise<{ success: boolean; error?: string }>;
    
}

export const useMediasoupProducerStore = create<MediasoupProducerState>((set, get) => ({
    device: null,
    routerRtpCapabilities: null,
    joined: false,
    sendTransport: null,
    error: "",
    producers: {
      audio: null,
  },
  



    joinRoom: async(roomId, userId, username) => {
        try {
            const { routerRtpCap } = await socket.emitWithAck("joinRoom", { roomId, userId, username })

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

                console.log(audioProducer)

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

    createSendTransport: async(roomId) => {
        try {
            const { getDevice } = get()

            const device = await getDevice()

            const { clientTransportParams } = await socket.emitWithAck('createProducerTransport', {
              roomId,
            });

            const transport = device.createSendTransport(clientTransportParams);
           
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

    connectProducerPlainTransport: async (plainTransportParams, roomId) => {
            try {
                if (!socket?.connected) {
                    throw new Error("AI socket is not connected");
                }
    
                console.log(plainTransportParams)
    
                const response = await socket.emitWithAck("connect-plain-transport", {
                  ip: plainTransportParams.ip,
                  port: plainTransportParams.port,
                  rtcpPort: plainTransportParams.rtcpPort,
                  roomId
                })
          
                if(response.success !== true) {
                    set({ error: "Failed to connect plain transport. Please try again later." });
                    return { success: false, error: "Failed to connect plain transport." };
                }
    
                return { success: true };
          
              } catch (error) {
    
                console.error("Error connecting plain transport:", error);
                set({ error: "Error connecting plain transport. Please check your connection." });
                return { success: false, error: (error as Error).message };
              }
      },

    forwardMedia: async (roomId) => {
           try {
             const rtpParameters = await socket.emitWithAck("forward-media", { roomId })

             console.log("Forward", rtpParameters)

             return rtpParameters
           } catch (error) {
            console.error(`Failed to forward media: ${(error as Error).message}`);
            set({ error: "Failed to process the request please try again later"})
            throw new Error(`Failed to forward media: ${(error as Error).message}`);
           }
    },

    createProducerPlainTransport: async (roomId) => {
        try {
            const plainTransportParams = await socket.emitWithAck("create-plain-transport", {
                roomId
            })

            console.log("plain", plainTransportParams)

            return plainTransportParams
        } catch (error) {
            console.error("Failed to create plain Transport", error)
            set({ error: "Something went wrong please try again later"})
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
    }


}))