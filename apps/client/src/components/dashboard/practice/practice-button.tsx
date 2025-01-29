"use client"

import { Button } from '@/components/ui/button'
import { createRoom } from '@/helpers/room';
import useShowToast from '@/hooks/use-show-toast';
import { useSession } from '@/lib/auth-client'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from "uuid"


export default function PracticeButton() {
  const showToast = useShowToast()
  const { data:session } = useSession()
  const router = useRouter()

  if(!session) {
    return;
  }

  const startPracticeHandler = async () => {
    console.log("click")
    const randomId = uuidv4()

    const response = await createRoom(
      {
        userId: session.user.id,
        name: `${session.user.name} Room - ${randomId}`
      }
    )

    console.log(response)

      if(response.success) {
        router.replace(`/room/${response.roomId}`)
      }

      if(response.error) {
        showToast({
          title:"Room Creation Error",
          description: `${response.error}`,
          type: 'error'
        })
      }
  }

  return (
    <>
    <Button
    onClick={() => startPracticeHandler()}
    >
        Start Practing
        <ArrowUpRight />
    </Button>
    </>
  )
}
