"use client";

import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Button } from "@roro-ai/ui/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@roro-ai/ui/components/ui/form";
import { ArrowUpRight, CircleAlert } from "lucide-react";
import TopicsButton from './topics-button';
import { PromptTopic } from "@/lib/prompt-contant";
import { AutosizeTextarea } from "./autosize-textarea";
import usePrompt from "@/hooks/use-prompt";
import { useSession } from "@/features/auth/auth-client";
import Loader from "@/components/global/loader";

export default function PromptInput() {
  const { data } = useSession()
  const [roomCount, setRoomCount] = useState<number>(0);
  const { startPracticeHandler, promptValue, setValue, handlePromptTemplate, promptForm, getRoomCount, loading } = usePrompt();

  useEffect(() => {
    const getCount = async () => {
      try {
        const data = await getRoomCount();
        setRoomCount(data.count);
      } catch (error) {
        console.error("Failed to fetch room count:", error);
      }
    };

    getCount()
  }, [getRoomCount])

  return (
    <div className="flex justify-center items-center min-h-[40.1rem] p-4">
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
                      <AutosizeTextarea
                        {...field}
                        value={promptValue}
                        onChange={(e) => {
                          setValue("prompt", e.target.value, { shouldDirty: true, shouldTouch: true })
                          setValue("topic", "custom", { shouldDirty: true, shouldTouch: true })
                        }}
                        placeholder="Type your scenario here..."
                        maxHeight={200}
                        className="w-full p-4 min-h-[100px] text-base resize-none overflow-hidden border-none bg-transparent scrollbar overflow-y-scroll scrollbar-thumb-zinc-900 scrollbar-track-rounded-full scrollbar-track-transparent scrollbar-thumb-rounded-full"
                      />
                      <div className="mt-4 flex justify-end items-center gap-2">
                        <span
                        className="flex gap-1 text-muted-foreground text-xs font-semibold"
                        >
                          <CircleAlert className="w-4 h-4"/>
                          Total Session {roomCount}/3
                        </span>
                        <Button
                          type="submit"
                          disabled = {(roomCount >= 3) && data?.user.role === 'user' || loading}
                          className="rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-500/20"
                        >
                          {loading ? (
                            <Loader />
                          ): (
                            <span>Start Practice</span>
                          )}
                          
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-4 grid grid-rows-2 sm:grid-cols-2 gap-2 lg:grid-cols-4 md:grid-cols-2 md:grid-rows-1">
              {PromptTopic.map(({ topic, prompt }) => (
                <TopicsButton
                  key={topic}
                  topic={topic}
                  onClick={() => handlePromptTemplate({prompt, topic})}
                />
              ))}
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
