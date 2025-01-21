import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'


export default function HeroSectionButtons() {
    return (
        <div className='flex items-center gap-x-4'>
            <Button
                asChild
                size={"lg"}
            >
                <Link
                    href={"/auth/login"}
                    className='font-semibold'
                >
                    Get Started
                    <ArrowRight />
                </Link>
            </Button>
            <Button
                asChild
                size={"lg"}
                variant={"outline"}
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
