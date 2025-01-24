import type React from 'react'

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='flex items-center justify-center h-screen w-screen'>{children}</div>
  )
}
