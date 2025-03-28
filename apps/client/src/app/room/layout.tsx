import type React from 'react'

export default function RoomLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">{children}</div>
    </div>
  )
}