import { create } from "zustand"


type MediaState = {
    isVideoOn: boolean,
    isMicOn: boolean,
    localStream : MediaStream | null
    error: string

    
    getUserMedia: () => Promise<void>
    getLocalStream: () => MediaStream,
}

export const useMediaStore = create<MediaState>((set, get) => ({
    isVideoOn: true,
    isMicOn: true,
    localStream: null,
    error: "",
    remoteStream: null,
    

    getUserMedia: async () =>  {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                noiseSuppression: true,
                autoGainControl: true,
                echoCancellation: true,
                sampleRate: 16000,
                channelCount: 1,
              },
              video: true,
            });
            set({ localStream: stream});

          } catch (error) {
            console.error(`[Failed to get media stream]: ${(error as Error).message}`);
            set({ error: "Failed to get media "})
            throw new Error(`[Failed to get media stream]: ${(error as Error).message}`);
          }
    },

    

    getLocalStream: () => {
        const { localStream } = get();
        if (!localStream) {
           throw new Error("Local media stream is not available");
        }
    return localStream;
    },

    stopUserMedia: () => {
        const { localStream } = get();
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
          set({ localStream: null });
          console.log("Local media stream stopped.");
        }
    },


}))