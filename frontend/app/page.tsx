'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { BackgroundLines } from '@/components/ui/background-lines'
import { ConnectWallet } from '@/components/connect-wallet'

export default function HomePage() {
  const router = useRouter()
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected)

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Navigation */}
      <Navbar currentPage="home" />

      {/* Background Lines with Content */}
      <BackgroundLines 
        className="flex items-center justify-center w-full flex-col px-4 pt-6 md:pt-8"
        svgOptions={{ duration: 6 }}
      >
        <div className="relative z-20 mb-6">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 p-[1.5px]">
            <div className="rounded-full px-4 py-1 bg-black/80 backdrop-blur-sm">
              <span className="text-sm md:text-sm font-semibold tracking-wide text-white">Avalanche Powered</span>
            </div>
          </div>
        </div>
        <h2 className="text-white text-center text-2xl md:text-4xl lg:text-8xl font-sans pt-0 md:pt-4 pb-6 md:pb-8 relative z-20 font-medium tracking-tight -mt-2">
          Launch <span className="text-red-500">Avalanche</span> Subnets, <br /> In <span className="relative inline-block">
            <span className="relative z-10">Minutes</span>
            <svg className="absolute -bottom-3 left-0 w-[115%] h-6 pointer-events-none z-0" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="minutes-underline" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              {/* long gentle swoosh */}
              <path d="M5 40 C 100 30, 200 30, 295 36" stroke="url(#minutes-underline)" strokeWidth="10" strokeLinecap="round" opacity="0.9"/>
              {/* shorter overlapping swoosh */}
              <path d="M120 46 C 170 49, 210 47, 235 44 C 200 46, 170 49, 140 46" stroke="url(#minutes-underline)" strokeWidth="8" strokeLinecap="round" opacity="0.8"/>
            </svg>
          </span>.
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 font-bold text-center">
        No CLI. No hassle. Just build, deploy and manage with a click.
        </p>
        <div className="relative z-20 mt-8">
          <ConnectWallet />
        </div>
      </BackgroundLines>
    </div>
  )
}