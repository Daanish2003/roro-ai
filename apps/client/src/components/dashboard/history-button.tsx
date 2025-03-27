import { Button } from '@roro-ai/ui/components/ui/button'
import { ArrowUpRight,} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function HistoryButton() {
  return (
    <Button
    asChild
    variant={"link"}
    className='text-accent-foreground'

    > 
      <Link
        href={"/history"}
      >
        History
        <ArrowUpRight />
      </Link>
    </Button>
  )
}
