'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  BarChart3, 
  FolderOpen, 
  Plus,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navbar currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[150px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Welcome to Avax Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your gateway to creating, deploying, and monitoring Avalanche subnets. 
            Choose your next action below.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Create New Subnet */}
          <div className="glass-card group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create New Subnet</h3>
            <p className="text-gray-300 mb-6">
              Start from scratch with our visual builder. Configure VM types, validators, 
              and tokenomics with drag-and-drop ease.
            </p>
            <Link href="/builder">
              <Button className="w-full glass-button">
                Start Building
              </Button>
            </Link>
          </div>

          {/* Use Template */}
          <div className="glass-card group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Use Template</h3>
            <p className="text-gray-300 mb-6">
              Browse our library of pre-configured templates. Save time by starting 
              with proven subnet configurations.
            </p>
            <Link href="/templates">
              <Button className="w-full glass-button">
                Browse Templates
              </Button>
            </Link>
          </div>

          {/* Monitor Subnets */}
          <div className="glass-card group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Monitor Subnets</h3>
            <p className="text-gray-300 mb-6">
              Track your deployed subnets in real-time. Monitor block height, TPS, 
              validators, and health status.
            </p>
            <Link href="/monitor">
              <Button className="w-full glass-button">
                View Monitoring
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">0</h3>
            <p className="text-gray-300">Active Subnets</p>
          </div>

          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">0</h3>
            <p className="text-gray-300">Validators</p>
          </div>

          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">0</h3>
            <p className="text-gray-300">Templates Used</p>
          </div>

          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">0</h3>
            <p className="text-gray-300">Deployments</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card">
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-2">Start by creating your first subnet</p>
          </div>
        </div>
      </div>
    </div>
  )
}
