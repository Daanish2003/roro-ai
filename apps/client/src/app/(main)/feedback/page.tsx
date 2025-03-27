import FeedbackContent from '@/features/feedback/components/feedback-content'
import { Separator } from '@roro-ai/ui/components/ui/separator'
import React from 'react'

export default function FeedbackPage() {
  return (
    <div className='p-6 max-w-3xl mx-auto mt-10'>
      <span className='text-2xl font-semibold mb-2'>Send Feedback</span>
      <p className='text-gray-400 mb-8'>We value your input to improve our platform</p>
      <Separator className='mb-8'/>
      <FeedbackContent />
    </div>
  )
}
