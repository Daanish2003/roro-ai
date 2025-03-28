"use client"
import { useMediasoupStore } from '@/store/useMediasoupStore'
import { Sidebar, SidebarContent, SidebarHeader } from '@roro-ai/ui/components/ui/sidebar'
import React from 'react'

export default function Transcription({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { joined } = useMediasoupStore()
  return (
    <>
      {joined && (
        <Sidebar {...props} collapsible='offcanvas' side='right' className='w-80 border-l-2'>
        <SidebarContent
        className='flex justify-center items-center bg-background'
        >
          <SidebarHeader>
            <h1 className='font-semibold text-2xl'>Transcription</h1>
          </SidebarHeader>
        </SidebarContent>
      </Sidebar>
      )}
    </>
  )
}
