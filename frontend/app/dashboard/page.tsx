'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight,
  TrendingUp,
  Activity,
  Database,
  Network,
  Play,
  FolderOpen,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-black to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_50%)]"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.05),transparent_50%)]"></div>
      </div>

      {/* Navigation */}
      <Navbar currentPage="dashboard" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Enhanced Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-300">Dashboard Active</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
            Your Avalanche subnet command center. Create, deploy, and monitor with enterprise-grade tools and real-time analytics.
          </p>
        </div>

        {/* Enhanced Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black/60"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <TrendingUp className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-3">0</h3>
              <p className="text-gray-400 text-sm font-medium">Active Subnets</p>
              <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black/60"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <Activity className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-3">0</h3>
              <p className="text-gray-400 text-sm font-medium">Validators</p>
              <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 transform rotate-45 group-hover:rotate-0 transition-transform duration-500" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-black/60"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <Database className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-3">0</h3>
              <p className="text-gray-400 text-sm font-medium">Templates Used</p>
              <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-500" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-black/60"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <Network className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-3">0</h3>
              <p className="text-gray-400 text-sm font-medium">Deployments</p>
              <div className="mt-6 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-orange-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {/* Create New Subnet */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">Create New Subnet</h3>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Start from scratch with our visual builder. Configure VM types, validators, 
                and tokenomics with drag-and-drop ease.
              </p>
              <Link href="/builder">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-lg group-hover:scale-105">
                  <Play className="w-5 h-5 mr-3" />
                  Start Building
                </Button>
              </Link>
            </div>
          </div>

          {/* Use Template */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-10 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-800 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-400 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-green-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">Use Template</h3>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Browse our library of pre-configured templates. Save time by starting 
                with proven subnet configurations.
              </p>
              <Link href="/templates">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 text-lg group-hover:scale-105">
                  <FolderOpen className="w-5 h-5 mr-3" />
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>

          {/* Monitor Subnets */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 transform rotate-45 group-hover:rotate-0 transition-transform duration-500" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-purple-400 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">Monitor Subnets</h3>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Track your deployed subnets in real-time. Monitor block height, TPS, 
                validators, and health status.
              </p>
              <Link href="/monitor">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 text-lg group-hover:scale-105">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  View Monitoring
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
          <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-10 border border-gray-500/20 hover:border-gray-500/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-bold text-white">Recent Activity</h3>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-gray-400" />
                <span className="text-gray-400 text-lg font-medium">Last 24 hours</span>
              </div>
            </div>
            
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-transparent"></div>
              </div>
              <h4 className="text-2xl font-semibold text-gray-300 mb-4">No Recent Activity</h4>
              <p className="text-gray-500 mb-8 text-lg">Start by creating your first subnet to see activity here</p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-3 text-gray-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-base font-medium">Ready to deploy</span>
                </div>
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-base font-medium">No issues detected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
