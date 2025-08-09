'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { ConnectWallet } from '@/components/connect-wallet'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const router = useRouter()
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const problemRef = useRef<HTMLDivElement>(null)
  const solutionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  useEffect(() => {
    // Hero animation
    const heroTl = gsap.timeline()
    heroTl
      .fromTo(heroRef.current, 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      )
      .fromTo('.hero-title', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5"
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.3"
      )
      .fromTo('.hero-cta', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.2"
      )

    // Problem section animation
    gsap.fromTo(problemRef.current,
      { opacity: 0, x: -100 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 80%",
          end: "bottom 20%",
        }
      }
    )

    // Solution section animation
    gsap.fromTo(solutionRef.current,
      { opacity: 0, x: 100 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: solutionRef.current,
          start: "top 80%",
          end: "bottom 20%",
        }
      }
    )

    // Features animation
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
        }
      }
    )

    // Floating animation for decorative elements
    gsap.to('.floating-element', {
      y: -20,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">Subnet Studio</h1>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="hero-title text-6xl md:text-8xl font-bold mb-8 gradient-text">
            Build Avalanche Subnets
            <br />
            <span className="text-white">Without Code</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Create, deploy, and monitor custom Avalanche subnets with our intuitive drag-and-drop interface. 
            No CLI knowledge required.
          </p>
          <div className="hero-cta">
            <ConnectWallet />
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl floating-element"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-cyan-500/20 rounded-full blur-xl floating-element"></div>
      </section>

      {/* Problem Section */}
      <section ref={problemRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card">
            <h2 className="text-4xl font-bold mb-8 gradient-text text-center">The Problem</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚫</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Complex CLI Commands</h3>
                <p className="text-gray-300">Traditional subnet creation requires deep knowledge of avalanche-cli and complex command-line operations.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⏱️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Time-Consuming Setup</h3>
                <p className="text-gray-300">Hours spent on configuration, validation, and troubleshooting deployment issues.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Technical Barriers</h3>
                <p className="text-gray-300">High barrier to entry for non-technical users who want to leverage Avalanche subnets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={solutionRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card">
            <h2 className="text-4xl font-bold mb-8 gradient-text text-center">The Solution</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Visual Builder</h3>
                <p className="text-gray-300">Drag-and-drop interface for configuring VM types, validators, tokenomics, and governance.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">One-Click Deployment</h3>
                <p className="text-gray-300">Deploy to Fuji testnet instantly with automated validation and error handling.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Monitoring</h3>
                <p className="text-gray-300">Monitor block height, TPS, validators, and health status in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 gradient-text text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Drag & Drop Builder</h3>
              <p className="text-gray-300 mb-4">Intuitive visual interface for configuring subnet components with real-time validation.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• VM Type Selection (EVM, SpacesVM, CustomVM)</li>
                <li>• Validator Management</li>
                <li>• Tokenomics Configuration</li>
                <li>• Governance Settings</li>
              </ul>
            </div>

            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Template Library</h3>
              <p className="text-gray-300 mb-4">Save and share subnet configurations as reusable templates with the community.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Public Template Sharing</li>
                <li>• Custom Template Creation</li>
                <li>• Template Rating System</li>
                <li>• Version Control</li>
              </ul>
            </div>

            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Real-Time Monitoring</h3>
              <p className="text-gray-300 mb-4">Comprehensive dashboard for monitoring subnet performance and health metrics.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Block Height Tracking</li>
                <li>• TPS Monitoring</li>
                <li>• Validator Status</li>
                <li>• Health Indicators</li>
              </ul>
            </div>

            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Automated Deployment</h3>
              <p className="text-gray-300 mb-4">Streamlined deployment process with automated validation and error handling.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• One-Click Testnet Deployment</li>
                <li>• Automated Validation</li>
                <li>• Error Recovery</li>
                <li>• Deployment History</li>
              </ul>
            </div>

            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Wallet Integration</h3>
              <p className="text-gray-300 mb-4">Seamless MetaMask integration for secure wallet connections and transactions.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• MetaMask Support</li>
                <li>• Multi-Chain Support</li>
                <li>• Transaction Signing</li>
                <li>• Balance Display</li>
              </ul>
            </div>

            <div className="feature-card glass-card">
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 mb-4">Detailed analytics and insights for optimizing subnet performance.</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Performance Metrics</li>
                <li>• Usage Analytics</li>
                <li>• Cost Optimization</li>
                <li>• Trend Analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card">
            <h2 className="text-4xl font-bold mb-6 gradient-text">Ready to Build Your Subnet?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the future of decentralized infrastructure. Create your first subnet in minutes, not hours.
            </p>
            <ConnectWallet />
          </div>
        </div>
      </section>
    </div>
  )
}
