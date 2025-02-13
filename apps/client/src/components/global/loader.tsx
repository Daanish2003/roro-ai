import React from 'react'
import { Loader as SpinLoader } from "lucide-react"

export default function Loader() {
  return (
    <SpinLoader className='animate-spin h-14 w-14 text-primary'/>
  )
}
