'use client'

import Link from 'next/link'
import { ConnectWallet } from './connect-wallet'
import Image from 'next/image'

interface NavbarProps {
  currentPage?: 'dashboard' | 'builder' | 'templates' | 'monitor' | 'home'
}

export function Navbar({ currentPage = 'home' }: NavbarProps) {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', page: 'dashboard' },
    { href: '/builder', label: 'Builder', page: 'builder' },
    { href: '/templates', label: 'Templates', page: 'templates' },
    { href: '/monitor', label: 'Monitor', page: 'monitor' },
  ]

  return (
    <nav className="glass fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/logo.png"
                alt="Avax Studio Logo"
                width={22}
                height={22}
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-bold gradient-text text-white">Avax <span className="text-red-500">Studio</span></h1>
            </Link>
            {currentPage !== 'home' && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors ${
                      currentPage === item.page
                        ? 'text-gray-300'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  )
}
