"use client";

import { useToast } from "@/hooks/use-toast";

export default function useShowToast() {
  const { toast } = useToast();

  function showToast(
    { 
        title, 
        description, 
        type = "success" 
    } : { 
        title: string; 
        description: string; 
        type: "success" | "error"
    }) {
    toast({
      title,
      description,
      variant: type === "error" ? "destructive" : "default",
    });
  }

  return showToast;
}
