import { Card, CardContent, CardHeader, CardTitle } from '@roro-ai/ui/components/ui/card'
import React from 'react'

export default function ProgressCard() {
  return (
    <Card className='w-72 h-28'>
      <CardHeader>
        <CardTitle>
          Total Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h1 className='text-2xl'>
          0
        </h1>
      </CardContent>
    </Card>
  )
}
