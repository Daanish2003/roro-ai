import React, { ReactElement } from 'react'
import { RadioGroupItem } from "@roro-ai/ui/components/ui/radio-group"
import { Label } from "@roro-ai/ui/components/ui/label"

export default function FeedbackTypeOption(
    {
        id,
        icon,
        label,
        description,
        value
    }: {
        id: string,
        icon: ReactElement,
        label: string,
        description: string,
        value: string
    }
) {
  return (
    <div className='relative'>
        <RadioGroupItem value={value} id={id} className='peer sr-only'/>
        <Label
          htmlFor={id}
          className='flex flex-col items-center gap-2 rounded-md 
          border p-4 hover:bg-primary/10 
          peer-data-[state=checked]:border-green-500 
          peer-data-[state=checked]:bg-green-900/10 
          transition-all cursor-pointer'
        >
          <div className='bg-primary p-2 rounded-full'>
            {icon}
          </div>
          <div className='font-medium'>
             {label}
          </div>
          <div className='text-xs text-gray-400 text-center'>
            {description}
          </div>
        </Label>
    </div>
  )
}
