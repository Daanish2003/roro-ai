import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function LoginButton() {
    return (
        <Button
            asChild
            size={"lg"}
        >
            <Link
                href={"/auth/login"}
                className='font-semibold'
            >
                Login
            </Link>
        </Button>
    )
}
