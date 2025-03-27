import { useSocketStore } from '@/store/useSocketStore'
import Loader from '../global/loader'
import React from 'react'



export default function VideoContainer({localVideoRef}: {localVideoRef: React.RefObject<HTMLVideoElement | null>}) {
  const loading = useSocketStore((state) => state.loading)



  if(loading) {
    return (
      <div className='flex items-center justify-center'>
         <Loader />
      </div>
    )
  }
 


  return (
    <div className='border rounded-2xl h-[40rem] w-[36rem]'>
      <video ref={localVideoRef} autoPlay playsInline muted className="rounded-2xl object-cover h-full w-full"/>
    </div>
  )
}
