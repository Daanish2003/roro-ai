"use client"
import React from 'react'
import { GridBackground } from '../ui/grid-background'
import { MovingBorder } from '../ui/moving-border'
import { motion } from 'motion/react';
import HeroSectionButtons from './hero-section-buttons';


export default function CTASection() {
  return (
    <section className='py-20 relative overflow-hidden min-h-[400px] mt-18'>
        <GridBackground
        containerClassName='absolute inset-0'
        dotColor='#22c55e'
        dotSize={1.5}
        dotSpacing={30}
        hoverEffect={true}
        >
          <div className='container px-4 md:px-6 relative z-10'>
            <MovingBorder 
               containerClassName='max-w-4xl mx-auto'
               className='p-8 md:p-12'
               duration={5000}
               >
                <div className='relative z-10 max-w-3xl mx-auto text-center space-y-8'>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{once: true}}
                    className='text-3xl md:text-4xl font-bold'
                  >
                     Ready to Transform Your English Speaking Skills?
                  </motion.h2>
                  <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0}}
                  transition={{duration: 0.7, delay: 0.1}}
                  viewport={{once: true}}
                  className='text-xl text-muted-foreground'
                  >
                     Join thousands of users who are already improving their fluency, confidence, and clarity with Roro AI.
                  </motion.p>
                  <motion.div
                   initial={{opacity: 0, y: 20}}
                   whileInView={{ opacity: 1, y: 0}}
                   transition={{ duration: 0.7, delay: 0.2 }}
                   viewport={{ once: true }}
                   className='flex flex-wrap justify-center gap-4'
                  >
                    <HeroSectionButtons />
                  </motion.div>
                </div>
               </MovingBorder>
          </div>
        </GridBackground>
    </section>
  )
}
