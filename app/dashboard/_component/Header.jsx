"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'

import { usePathname } from 'next/navigation'
import React from 'react'
import { useEffect } from 'react'

function Header() {
    const path = usePathname();
    useEffect(()=>{
console.log(path)
    },[])
  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-md'>
        
       <Image  src={'/unigen-ai.jpg'} width={100} height={100} alt='logo'/>
       <ul className='flex gap-7 '>
        <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard' && 'text-primary font-bold'}`}>Dashboard</li>
        <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/Questions' && 'text-primary font-bold'}`}>Questions</li>
        <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/Upgrade' && 'text-primary font-bold'}`}>Upgrade</li>
        <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/How-it-works' && 'text-primary font-bold'}`}>How it works ?</li>

        <UserButton/>
       </ul>
 </div>
  )
} 

export default Header