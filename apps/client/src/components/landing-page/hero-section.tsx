import React from 'react'
import HeroSectionButtons from './hero-section-buttons'

export default function HeroSection() {
  return (
    <div className='h-[40rem] flex items-center justify-center'>
        <div className='flex flex-col w-[900px] items-center justify-center text-center gap-y-8'>
          <h1 className='font-bold text-6xl'>Master Fluent English Speaking with AI-Powered Practice</h1>
          <p className='text-2xl'>Real-time conversations to boost confidence and fluency.</p>
          <HeroSectionButtons />
        </div>
    </div>

  )
}