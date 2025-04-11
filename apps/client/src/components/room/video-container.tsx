import { useSocketStore } from '@/store/useSocketStore'
import Loader from '../global/loader'
import React from 'react'



export default function VideoContainer({localVideoRef}: {localVideoRef: React.RefObject<HTMLVideoElement | null>}) {
  const loading = useSocketStore((state) => state.loading)
 


  return (
    <div className={`border rounded-2xl lg:h-[36rem] lg:w-1/2 h-[18rem] w-[28rem] md:h-[40rem] md:w-1/2 ${loading ? 'flex items-center justify-center': ''}`}>
      { loading ? (
        <Loader />
      ): (
        <video ref={localVideoRef} autoPlay playsInline muted className="rounded-2xl object-cover h-full w-full"/>
      )}
    </div>
  )
}
