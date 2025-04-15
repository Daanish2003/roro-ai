import { create } from "zustand"


type MediaState = {
    isVideoOn: boolean,
    isMicOn: boolean,
    localStream : MediaStream | null
    error: string

    
    getUserMedia: () => Promise<void>
    getLocalStream: () => MediaStream,
    stopUserMedia: () => void
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
                //Don't use echo cancellation, noise suppression, or auto gain control
                // It could cause problems when interrupting the agent speech
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
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
          localStream.getTracks().forEach(async (track) => track.stop());
          const videoEl = document.querySelector('video');
        if (videoEl) videoEl.srcObject = null;
          set({ localStream: null });
          console.log("Local media stream stopped.");
        }
    },


}))