import ProgressCard from '@/components/dashboard/overview/progress-card'
import { Card, CardHeader, CardTitle } from '@roro-ai/ui/components/ui/card'
import React from 'react'

export default function OverviewPage() {
  return (
    <div className='flex justify-around py-4'>
      {/* <ProfileCard /> */}
      <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <ProgressCard />
      <ProgressCard />
      <ProgressCard />
      <ProgressCard />
      </div>
      <Card>
          <CardHeader>
            <CardTitle>
              Recent Sessions
            </CardTitle>
          </CardHeader>
      </Card>
      </div>
    </div>
  )
}
