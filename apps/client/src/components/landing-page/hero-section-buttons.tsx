import React from 'react'
import { Button } from '@roro-ai/ui/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'


export default function HeroSectionButtons() {
    return (
        <div className='flex flex-wrap justify-center gap-4'>
            <Button
                asChild
                size={"lg"}
                className='rounded-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-500/20'
            >
                <Link
                    href={"/auth/signup"}
                    className='font-semibold'
                >
                    Get Started
                    <ArrowRight className='h-4 w-4'/>
                </Link>
            </Button>
            <Button
                asChild
                size={"lg"}
                variant={"outline"}
                className='rounded-full'
            >
                <Link
                href={"https://githhub.com/Daanish2003/roro-ai"}
                >
                <Star />
                Give us a star
                <ArrowRight />
                </Link>
            </Button>
        </div>
    )
}