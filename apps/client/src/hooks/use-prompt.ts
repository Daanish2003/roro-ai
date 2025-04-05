import { useSession } from '@/features/auth/auth-client';
import { usePromptStore } from '@/store/usePrompt';
import { PromptSchema } from '@/zod/prompt-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function usePrompt() {
    const router = useRouter();
    const { data: session } = useSession();
    const { setPrompt } = usePromptStore();

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
                topic: values.topic
              }),
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
          }
    
          router.replace(`/room/${data.roomId}`);
        } catch (error) {
            if(error instanceof Error) {
                toast("Failed to start practice", {
                    description: error.message,
                    action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                    },
                })
            }
          console.error("Error starting practice:", error);
        }
      };

      const promptForm = useForm<z.infer<typeof PromptSchema>>({
        mode: "onSubmit",
        resolver: zodResolver(PromptSchema),
        defaultValues: {
          prompt: "",
          topic: "",
        },
      });
    
      const { watch, setValue } = promptForm;
      const promptValue = watch("prompt");
    
      const handlePromptTemplate = (values: z.infer<typeof PromptSchema>) => {
        setValue("prompt",  values.prompt, { shouldDirty: true, shouldTouch: true });
        setValue("topic", values.topic, { shouldDirty: true, shouldTouch: true })
      };

      const getRoomCount = useCallback(async () => {
        try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/get-room-count`,
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
            }
      
            return data
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
      }, []);

  return {
    startPracticeHandler,
    watch,
    setValue,
    promptValue,
    handlePromptTemplate,
    promptForm,
    getRoomCount
  }
}
