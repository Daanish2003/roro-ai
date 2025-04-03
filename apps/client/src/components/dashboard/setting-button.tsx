import { Button } from '@roro-ai/ui/components/ui/button'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function SettingsButton() {
  return (
    <Button 
    asChild
    className='bg-transparent text-white text-sm font-normal px-2 m-0 w-full content-start hover:bg-secondary/90 justify-start gap-2' >
        <Link href={"/settings"}>
           <Settings />
           Settings
        </Link>
    </Button>
  )
}
