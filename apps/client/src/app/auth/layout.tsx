import Logo from '@/components/landing-page/logo'

import Link from 'next/link'
import type React from 'react'

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10 w-screen items-center justify-center'>
        <div className='flex justify-center gap-2'>
          <Link href="/" className='flex items-center gap-2 font-medium'>
             <Logo />
          </Link>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}