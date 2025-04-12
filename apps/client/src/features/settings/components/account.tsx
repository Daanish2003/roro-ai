"use client"

import useShowToast from '@/hooks/use-show-toast'
import { deleteUser, updateUser, useSession } from '@/features/auth/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@roro-ai/ui/components/ui/avatar'
import { Button } from '@roro-ai/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@roro-ai/ui/components/ui/card'
import { Input } from '@roro-ai/ui/components/ui/input'
import { Edit2, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@roro-ai/ui/components/ui/dialog';

export default function Account() {
    const { data: session } = useSession()
    const showToast = useShowToast()
    const [usernameEdit, setUsernameEdit] = useState<boolean>(true)
    const [username, setUsername] = useState<string>("")
    const [usernameUpdateLoading, setUsernameUpdateLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    useEffect(() => {
      if(session) {
        setUsername(session.user.name)
      }
     }, [session])

    if(!session) {
        return null
    }

    

    const updateUsernameHandler = async () => {
      setUsernameUpdateLoading(true)
      try {
        await updateUser({
          name: username
        })
      } catch (error) {
        console.error("Failed to update user", error)
        showToast({
          title: "Something went wrong",
          description: "Failed to update the user",
          type: "error"
        })
      } finally {
        setUsernameEdit(true)
        setUsernameUpdateLoading(false)
      }
    }

    const deteleAccount = async () => {
      try {
        await deleteUser({
          callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/login`,
        })
      } catch (error) {
        console.error("Failed to delete user", error)
        showToast({
          title: "Something went wrong",
          description: "Failed to delete the user",
          type: "error"
        })
      } finally {
        setIsOpen(false)
      }
    }

  return (
    <Card className='w-[700px] mt-8'>
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <User />
                Account
            </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
           <div className='flex justify-between border-b pb-4 items-center'>
              <div>
                 <h3 className="font-medium text-base">Profile Picture</h3>
                  <p className="text-muted-foreground text-xs">You look good today!</p>
              </div>
              <div className='relative'>
                <Button size={"icon"} className='rounded-full absolute h-14 w-14 hover:z-10'>
                   <Edit2 />
                </Button>    
                <Avatar className="h-14 w-14 rounded-full hover:-z-10">
                   <AvatarImage src={session.user.image as string} alt={session.user.name} />
                   <AvatarFallback className="rounded-lg bg-primary">CN</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className='flex justify-between border-b pb-4 items-center'>
              <div>
                 <h3 className="font-medium text-base">Username</h3>
                 <p className="text-muted-foreground text-xs">Edit your username here!</p>
              </div>
              <div className='flex space-x-3 items-center'>
                <Input 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 disabled={usernameEdit}
                 className="h-[41px]"
                />
                {usernameEdit ? (
                  <Button 
                    size="icon" 
                    className='rounded-lg h-10 w-14'
                    onClick={() => setUsernameEdit(false)}
                    >
                      <Edit2 />
                  </Button>
                  ) : (
                    <Button
                       disabled={usernameUpdateLoading} 
                       onClick={updateUsernameHandler}>Submit</Button>
                  )}   
              </div>
            </div>
            <div className='flex justify-between border-b pb-4 items-center'>
              <div>
                 <h3 className="font-medium text-base text-destructive">Delete Account</h3>
                 <p className="text-destructive text-xs">Edit your username here!</p>
              </div>
              <Dialog
               open = {isOpen}
               onOpenChange={() => setIsOpen(true)}
              >
                 <DialogTrigger asChild>
                    <Button variant={"destructive"}>
                      Delete
                    </Button>
                 </DialogTrigger>
                 <DialogContent
                 className="[&>button]:hidden"
                 >
                   <DialogHeader>
                      <DialogTitle>
                           Delete Account
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delele this account
                      </DialogDescription>
                      <div className='flex justify-end items-center gap-2'>
                        <Button
                        onClick={() => setIsOpen(false)}
                        >
                          No
                        </Button>
                        <Button
                        onClick={deteleAccount}
                        >
                          Yes
                        </Button>
                      </div>
                   </DialogHeader>
                 </DialogContent>
              </Dialog>
            </div>
        </CardContent>
    </Card>
  )
}
