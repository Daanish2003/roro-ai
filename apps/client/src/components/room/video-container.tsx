import { useSocketStore } from '@/store/useSocketStore'
import Loader from '../global/loader'
import React from 'react'



export default function VideoContainer({localVideoRef}: {localVideoRef: React.RefObject<HTMLVideoElement | null>}) {
  const loading = useSocketStore((state) => state.loading)



  if(loading) {
    return (
      <div className='flex items-center justify-center sm:h-[34rem] lg:h-[45rem]'>
         <Loader />
      </div>
    )
  }
 


  return (
    <div className="flex-grow bg-card rounded-2xl overflow-hidden sm:h-[34rem] lg:h-[45rem]">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-fill rounded-2xl lg:aspect-[16/2] sm:aspect-[16/10] aspect-[17/16] border border-zinc-700" />
    </div>
  )
}
