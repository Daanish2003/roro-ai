"use client"

import { cn } from "@roro-ai/ui/lib/utils"
import { motion, stagger, useAnimate, useInView } from "motion/react"
import { useEffect } from "react"

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) => {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        },
      )
    }
  }, [isInView, animate])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {words.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.split("").map((char, index) => (
                <motion.span
                  initial={{
                    opacity: 0,
                    display: "none",
                  }}
                  key={`char-${index}`}
                  className={cn(`opacity-0 hidden`, word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div className={cn("text-base flex items-center", className)}>
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className={cn("inline-block h-4 w-[2px] bg-green-500 ml-1", cursorClassName)}
      ></motion.span>
    </div>
  )
}

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) => {
  const wordsArray = words.map((word) => word.text)
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)

  useEffect(() => {
    if (isInView) {
      let delay = 0
      wordsArray.forEach((_, index) => {
        const textToType = words[index].text
        const typingDuration = textToType.length * 0.1

        animate(
          `#word-${index}`,
          {
            opacity: 1,
          },
          {
            delay,
            duration: 0.2,
          },
        )

        animate(
          `#cursor-${index}`,
          {
            opacity: [0, 1],
          },
          {
            delay,
            duration: 0.2,
            repeat: typingDuration / 0.2,
            repeatType: "loop",
          },
        )

        delay += typingDuration + 0.2
      })
    }
  }, [isInView, animate, wordsArray, words])

  return (
    <div ref={scope} className={cn("text-base flex flex-col gap-3", className)}>
      {words.map((word, idx) => {
        return (
          <div key={`word-${idx}`} className="flex items-center">
            <div id={`word-${idx}`} className="opacity-0">
              {word.text}
            </div>
            <motion.span
              id={`cursor-${idx}`}
              initial={{
                opacity: 0,
              }}
              className={cn("inline-block h-4 w-[2px] bg-green-500 ml-1", cursorClassName)}
            ></motion.span>
          </div>
        )
      })}
    </div>
  )
}
