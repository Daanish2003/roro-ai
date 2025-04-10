"use client"
import { Button } from '@roro-ai/ui/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import FeedbackForm from './feedback-form'
import { toast } from 'sonner'

export default function FeedbackContent() {
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)

    const getFeedbackCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/feedbacks/get-feedback-count`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
          }
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          toast("Something went wrong", {
              description: data.message,
              action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                  },
          })

          return
        }

        console.log(data)

        setCount(data.count)

      } catch (error) {
          if(error instanceof Error) {
              toast("Failed get Room", {
                  description: error.message,
                  action: {
                      label: "Undo",
                      onClick: () => console.log("Undo"),
                  },
              })
          }
        console.error("Error starting practice:", error);
      }
    }

    useEffect(() => {
      getFeedbackCount()
    }, [])

    if(count >= 3) {
      return (
        <div className='bg-secondary/10 rounded-lg p-8 text-center border'>
                <div className='bg-green-900/30 text-green-400 rounded-full p-3 w-16 mx-auto mb-4 flex items-center justify-center'>
                  <ThumbsUp className='h-8 w-8'/>
                </div>
                <h2 className='text-xl font-semibold mb-2'>
                    Thank You for Your Feedback!
                </h2>
                <p className="text-gray-400 mb-6">You have reached your daily limit</p>
        </div>
      )
    }

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
                disabled={count >= 3}
                className='bg-primary hover:bg-primary/50 hover:text-white/50'
                >
                    {count >= 3 ? "You have reached the daily limit" :"Submit Another Feedback" }
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
