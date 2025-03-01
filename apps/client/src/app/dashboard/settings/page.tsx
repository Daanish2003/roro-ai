import SettingContent from '@/features/settings/components/setting-content'
import { Separator } from '@roro-ai/ui/components/ui/separator'
import React from 'react'

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <span className='text-2xl font-semibold mb-2'>User Settings</span>
      <p className='text-gray-400 mb-8'>Update your information here</p>
      <Separator className='mb-4'/>
      <SettingContent />
    </div>
  )
}
