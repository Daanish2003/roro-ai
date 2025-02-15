"use client";

import { motion } from "motion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@roro-ai/ui/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@roro-ai/ui/components/ui/form";
import { Textarea } from "@roro-ai/ui/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { PromptSchema } from "@/zod/prompt-schema";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import TopicsButton from './topics-button';
import useShowToast from '@/hooks/use-show-toast';

export default function PromptInput() {
  const showTaost = useShowToast()
  const router = useRouter();
  const { data: session } = useSession();

  const promptForm = useForm<z.infer<typeof PromptSchema>>({
    mode: "onBlur",
    resolver: zodResolver(PromptSchema),
    defaultValues: {
      prompt: "",
    },
  });



  const startPracticeHandler = async (values : z.infer<typeof PromptSchema>) => {
  
    try {
      const response  = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          roomName: `${session?.user.name}'s Room`,
          prompt: values.prompt
          }),
          credentials: 'include'
        })

      const data = await response.json()

      if(!response.ok) {
          showTaost({
            title: "Something went wrong",
            description: data.message || "Failed to start session",
            type: "error"
          }) 
      }

      router.replace(`/room/${data.roomId}`)

    } catch (error) {
      showTaost({
        title: "Error",
        description: "Failed to start practice. Please try again.",
        type: "error"
      })
      console.error("Error starting practice:", error)
    }
  }

  return (
    <div className="flex mt-[200px] justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl space-y-8"
      >
        <h1 className="font-extrabold text-4xl sm:text-5xl text-center bg-clip-text text-transparent bg-foreground">
          Describe your scenario
        </h1>
        <Form {...promptForm}>
          <form onSubmit={promptForm.handleSubmit(startPracticeHandler)}>
            <FormField
              control={promptForm.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col border border-green-300 dark:border-green-700 bg-transparent dark:bg-green-800 shadow-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-shadow duration-200 rounded-xl p-2">
                      <Textarea
                        placeholder="Type your scenario here..."
                        className="w-full p-4 min-h-[100px] text-base resize-none overflow-hidden border-none"
                        {...field}
                      />
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="submit"
                          disabled={false}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-green-800"
                        >
                          <span>{false ? "Processing..." : "Start Practice"}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-4 flex justify-evenly">
               <TopicsButton 
               topic="Job Interview"
               />
               <TopicsButton 
               topic="Self Introduction"
               />
               <TopicsButton 
               topic="Meeting new People"
               />
               <TopicsButton 
               topic="Conflict Resolution"
               />
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
