import React from 'react'
import Logo from './logo'
import LoginButton from './login-button'
import GithubStarButton from './github-start-button'
import { ToggleThemeButton } from './toggle-theme-button'
import { Separator } from '@roro-ai/ui/components/ui/separator'

export default function LandingNavbar() {
  return (
    <div className='border-b px-6 py-2 flex justify-between items-center'>
        <Logo />
        <div className='flex items-center gap-x-2'>
        <ToggleThemeButton />
        <GithubStarButton />
        <Separator orientation='vertical' className='h-8'/>
        <LoginButton />
        </div>
    </div>
  )
}