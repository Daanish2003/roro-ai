"use client";

import { motion } from "motion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@roro-ai/ui/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@roro-ai/ui/components/ui/form";
import { useSession } from "@/lib/auth-client";
import { PromptSchema } from "@/zod/prompt-schema";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import TopicsButton from './topics-button';
import useShowToast from '@/hooks/use-show-toast';
import { PromptTopic } from "@/lib/prompt-contant";
import { AutosizeTextarea } from "./autosize-textarea"; // Import the updated component
import { usePromptStore } from "@/store/usePrompt";

export default function PromptInput() {
  const router = useRouter();
  const showToast = useShowToast();
  const { data: session } = useSession();

  const { setPrompt } = usePromptStore()

  const promptForm = useForm<z.infer<typeof PromptSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(PromptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const { watch, setValue } = promptForm;
  const promptValue = watch("prompt");

  const startPracticeHandler = async (values: z.infer<typeof PromptSchema>) => {
    setPrompt(values.prompt)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: `${session?.user.name}'s Room`,
            prompt: values.prompt,
          }),
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast({
          title: "Something went wrong",
          description: data.message || "Failed to start session",
          type: "error",
        });
      }

      router.replace(`/room/${data.roomId}`);
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to start practice. Please try again later.",
        type: "error",
      });
      console.error("Error starting practice:", error);
    }
  };

  const handlePromptTemplate = (prompt: string) => {
    setValue("prompt",  prompt, { shouldDirty: true, shouldTouch: true });
  };

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
                        onChange={(e) => setValue("prompt", e.target.value, { shouldDirty: true, shouldTouch: true })}
                        placeholder="Type your scenario here..."
                        maxHeight={200}
                        className="w-full p-4 min-h-[100px] text-base resize-none overflow-hidden border-none bg-transparent scrollbar overflow-y-scroll scrollbar-thumb-zinc-900 scrollbar-track-rounded-full scrollbar-track-transparent scrollbar-thumb-rounded-full"
                      />
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="submit"
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-green-800"
                        >
                          <span>Start Practice</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-4 flex justify-evenly">
              {PromptTopic.map(({ topic, prompt }) => (
                <TopicsButton
                  key={topic}
                  topic={topic}
                  onClick={() => handlePromptTemplate(prompt)}
                />
              ))}
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
