import Link from 'next/link'
import React from 'react'


export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="rounded-full bg-gradient-to-r from-green-500 to-green-700 p-1 shadow-lg shadow-green-500/20">
        <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
          <span className="text-green-500 font-bold">R</span>
        </div>
      </div>
      <span className="font-bold text-xl">Roro AI</span>
    </Link>
  )
}