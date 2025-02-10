import { AiSocket } from "@/lib/socket"
import { create } from "zustand"
import * as mediasoupClient from 'mediasoup-client';


type MediasoupConsumerState = {
    error: string,
    recvTransport: mediasoupClient.types.Transport | null
    remoteStream: MediaStream | null


    consumerJoinRoom: (roomId: string) => Promise<void>
    createConsumerPlainTransport: (roomId: string) => Promise<{ ip: string; port: number; rtcpPort?: number }>;
    createRecvTransport: (roomId: string, device: mediasoupClient.types.Device) => Promise<{ success: boolean; error?: string }>;
    startConsumerProducing: (roomId: string , rtpParameters: mediasoupClient.types.RtpParameters) => Promise<{ success: boolean; error?: string }>;
    startConsuming: (device: mediasoupClient.types.Device, roomId:string) => Promise<void> 
}

export const useMediasoupConsumerStore = create<MediasoupConsumerState>((set, get) => ({
    error: "",
    recvTransport: null,
    remoteStream: null,

    consumerJoinRoom: async (roomId: string) => {
        try {
            if (!AiSocket?.connected) {
                throw new Error("AI socket is not connected");
            }

            const response = await AiSocket.emitWithAck("joinRoom", { roomId });

            if (!response.success) {
                set({ error: "Failed to join room. Please try again later." });
                return;
            }

            } catch (error) {
               console.error("Error joining room:", error);
               set({ error: "Error joining room. Please check your connection." });
            }
    },

    createConsumerPlainTransport: async (roomId: string) => {
        try {
            const plainTransportParams = await AiSocket.emitWithAck("create-plain-transport", { roomId })

              return plainTransportParams

        } catch (error) {
            console.error("Error creating plain transport:", error);
            set({ error: "Error creating plain transport. Please check your connection." });
            return { success: false, error: (error as Error).message };
            
        }
    },

    


    createRecvTransport: async (roomId, device) => {
      try {
          if (!AiSocket || !AiSocket.connected) {
              throw new Error("AI socket is not connected");
          }
  
          const { clientTransportParams } = await AiSocket.emitWithAck('createConsumerTransport', { roomId });
  
          if (!clientTransportParams || !clientTransportParams.dtlsParameters) {
              throw new Error("Invalid transport parameters received");
          }
  
          console.log("🚚 client transport params", clientTransportParams.dtlsParameters);
  
          const transport = device.createRecvTransport(clientTransportParams);

          console.log("🚚 Transport Consumer:", transport)
  
          console.log("🚚 Consumer transport", transport);
  
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
  

    startConsumerProducing: async (roomId, rtpParameters) => {
        try {
            if (!AiSocket?.connected) {
                throw new Error("AI socket is not connected");
            }

            await AiSocket.emitWithAck("start-ai-produce", { roomId, rtpParameters });

            return { success: true };
         } catch (error) {
            console.error("Error starting AI producing:", error);
            return { success: false, error: (error as Error).message };
         }
    },

    startConsuming: async (device, roomId) => {
   
      const { recvTransport } = get();
      if (!recvTransport) {
        throw new Error('Receive transport not initialized');
      }
      if (!device || !device.loaded) {
        throw new Error("Mediasoup device is not loaded.");
      }
      try {
        
        const response = await AiSocket.emitWithAck('consume-media', {
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
        
        const res = await AiSocket.emitWithAck("unpauseConsumer", { roomId });
        
        
        consumer.resume()

        set({ remoteStream: newRemoteStream });
        
      } catch (error) {
        throw new Error(`Failed to start consuming: ${(error as Error).message}`);
      }
    },
    



}))