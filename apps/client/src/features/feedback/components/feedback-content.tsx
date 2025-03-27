"use client"
import { Button } from '@roro-ai/ui/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import React, { useState } from 'react'
import FeedbackForm from './feedback-form'

export default function FeedbackContent() {
    const [submitted, setSubmitted] = useState<boolean>(false)


    if (submitted) {
        return (
            <div className='bg-secondary/10 rounded-lg p-8 text-center border'>
                <div className='bg-green-900/30 text-green-400 rounded-full p-3 w-16 mx-auto mb-4 flex items-center justify-center'>
                  <ThumbsUp className='h-8 w-8'/>
                </div>
                <h2 className='text-xl font-semibold mb-2'>
                    Thank You for Your Feedback!
                </h2>
                <p className="text-gray-400 mb-6">Your input helps us improve our platform for everyone.</p>
                <Button
                onClick={() => setSubmitted(false)}
                className='bg-primary hover:bg-primary/50 hover:text-white/50'
                >
                    Submit Another Feedback
                </Button>
            </div>
        )
    }


  return (
    <FeedbackForm 
     setSubmitted={setSubmitted}
    />
  )
}
