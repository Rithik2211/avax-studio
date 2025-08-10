'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Network, 
  Database,
  BarChart3,
  Users,
  Zap,
  Globe,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Subnet {
  id: string
  name: string
  description: string
  vmType: string
  network: string
  status: string
  subnetId: string
  blockchainId: string
  rpcEndpoint: string
  createdAt: string
  updatedAt: string
  deployment?: {
    id: string
    status: string
    startedAt: string
    completedAt: string
    transactionHash: string
    blockNumber: number
    gasUsed: number
  }
}

interface Stats {
  subnets: {
    total: number
    active: number
    deploying: number
    failed: number
  }
  templates: {
    total: number
    public: number
    private: number
    usageCount: number
  }
  deployments: {
    total: number
    successful: number
    failed: number
  }
}

export default function MonitorPage() {
  const { address } = useSelector((state: RootState) => state.wallet)
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      fetchSubnets()
      fetchStats()
    }
  }, [address])

  const fetchSubnets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitor?userId=${address}`)
      if (response.ok) {
        const data = await response.json()
        setSubnets(data.subnets || [])
      }
    } catch (error) {
      console.error('Error fetching subnets:', error)
      toast.error('Failed to fetch subnets')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitor/stats/overview?userId=${address}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(type)
      toast.success(`${type} copied to clipboard!`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'deploying':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500'
      case 'deploying':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateHash = (hash: string, length: number = 8) => {
    if (!hash) return 'N/A'
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <Navbar currentPage="monitor" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[120px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading monitoring data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <Navbar currentPage="monitor" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[120px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">Subnet Monitor</h1>
            <p className="text-gray-300">
              Monitor your deployed subnets and track their performance
            </p>
          </div>
          <Button
            onClick={() => {
              fetchSubnets()
              fetchStats()
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Enhanced Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Subnets Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden">
                      <Network className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black/60"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.subnets.total}</h3>
                <p className="text-gray-400 text-sm font-medium mb-3">Total Subnets</p>
                <p className="text-xs text-gray-400 mb-4">
                  {stats.subnets.active} active, {stats.subnets.deploying} deploying
                </p>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>

            {/* Deployments Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-500 overflow-hidden">
                      <BarChart3 className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/60"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.deployments.total}</h3>
                <p className="text-gray-400 text-sm font-medium mb-3">Deployments</p>
                <p className="text-xs text-gray-400 mb-4">
                  {stats.deployments.successful} successful, {stats.deployments.failed} failed
                </p>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-600 to-green-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>

            {/* Templates Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden">
                      <Database className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black/60"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.templates.total}</h3>
                <p className="text-gray-400 text-sm font-medium mb-3">Templates</p>
                <p className="text-xs text-gray-400 mb-4">
                  {stats.templates.public} public, {stats.templates.private} private
                </p>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>

            {/* Template Usage Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-500 overflow-hidden">
                      <Users className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-black/60"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stats.templates.usageCount}</h3>
                <p className="text-gray-400 text-sm font-medium mb-3">Template Usage</p>
                <p className="text-xs text-gray-400 mb-4">Total template downloads</p>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-600 to-orange-800 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subnets List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Deployed Subnets</h2>
            <span className="text-gray-400">{subnets.length} subnets</span>
          </div>

          {subnets.length === 0 ? (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-12 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 text-center">
                <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6 group-hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden">
                  <Network className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">No subnets deployed</h3>
                <p className="text-gray-400 mb-6 text-lg">
                  Deploy your first subnet to start monitoring its performance
                </p>
                <Button 
                  onClick={() => window.location.href = '/builder'}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 group-hover:scale-105"
                >
                  Go to Builder
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {subnets.map((subnet) => (
                <div key={subnet.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden">
                            {getStatusIcon(subnet.status)}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black/60"></div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {subnet.name}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {subnet.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(subnet.status)}`}>
                          {subnet.status}
                        </span>
                        <span className="text-xs text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                          {subnet.vmType.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Subnet ID */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Subnet ID
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-800/50 px-3 py-2 rounded-lg text-green-400 border border-gray-700">
                            {truncateHash(subnet.subnetId, 12)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(subnet.subnetId, 'Subnet ID')}
                            className="h-8 w-8 p-0 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                          >
                            {copiedId === 'Subnet ID' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Blockchain ID */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Blockchain ID
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-800/50 px-3 py-2 rounded-lg text-blue-400 border border-gray-700">
                            {truncateHash(subnet.blockchainId, 12)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(subnet.blockchainId, 'Blockchain ID')}
                            className="h-8 w-8 p-0 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                          >
                            {copiedId === 'Blockchain ID' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Network */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          Network
                        </label>
                        <div className="flex items-center gap-2 bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white capitalize">{subnet.network}</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          Created
                        </label>
                        <div className="text-sm text-white bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700">
                          {formatDate(subnet.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Deployment Details */}
                    {subnet.deployment && (
                      <div className="mt-6 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <h4 className="text-sm font-medium text-gray-300">Deployment Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              Transaction Hash
                            </label>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-800/50 px-3 py-2 rounded-lg text-yellow-400 border border-gray-700">
                                {truncateHash(subnet.deployment.transactionHash, 8)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(subnet.deployment.transactionHash, 'Transaction Hash')}
                                className="h-8 w-8 p-0 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                              >
                                {copiedId === 'Transaction Hash' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              Block Number
                            </label>
                            <div className="text-sm text-white bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700">
                              {subnet.deployment.blockNumber || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              Gas Used
                            </label>
                            <div className="text-sm text-white bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700">
                              {subnet.deployment.gasUsed?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-700 flex gap-2">
                      {subnet.rpcEndpoint && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(subnet.rpcEndpoint, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          RPC Endpoint
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(subnet.rpcEndpoint, 'RPC URL')}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        Copy RPC URL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
