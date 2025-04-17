import Link from 'next/link'
import React from 'react'
import { FaXTwitter } from "react-icons/fa6";

export default function FooterLinks() {
  return (
    <div>
        <Link
          href={"https://x.com/daanish288275"}
         >
           <FaXTwitter/>
        </Link>
    </div>
  )
}
