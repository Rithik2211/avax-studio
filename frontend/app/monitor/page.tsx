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
            <h1 className="text-4xl font-bold mb-2 text-red-500">Subnet Monitor</h1>
            <p className="text-gray-300">
              Monitor your deployed subnets and track their performance
            </p>
          </div>
          <Button
            onClick={() => {
              fetchSubnets()
              fetchStats()
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Subnets</CardTitle>
                <Network className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.subnets.total}</div>
                <p className="text-xs text-gray-400">
                  {stats.subnets.active} active, {stats.subnets.deploying} deploying
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Deployments</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.deployments.total}</div>
                <p className="text-xs text-gray-400">
                  {stats.deployments.successful} successful, {stats.deployments.failed} failed
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Templates</CardTitle>
                <Database className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.templates.total}</div>
                <p className="text-xs text-gray-400">
                  {stats.templates.public} public, {stats.templates.private} private
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Template Usage</CardTitle>
                <Users className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.templates.usageCount}</div>
                <p className="text-xs text-gray-400">Total template downloads</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subnets List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Deployed Subnets</h2>
            <span className="text-gray-400">{subnets.length} subnets</span>
          </div>

          {subnets.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-300">No subnets deployed</h3>
                <p className="text-gray-400 mb-4">
                  Deploy your first subnet to start monitoring its performance
                </p>
                <Button onClick={() => window.location.href = '/builder'}>
                  Go to Builder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {subnets.map((subnet) => (
                <Card key={subnet.id} className="glass-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {getStatusIcon(subnet.status)}
                          {subnet.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {subnet.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getStatusColor(subnet.status)}`}>
                          {subnet.status}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {subnet.vmType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Subnet ID */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400">Subnet ID</label>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400">
                            {truncateHash(subnet.subnetId, 12)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(subnet.subnetId, 'Subnet ID')}
                            className="h-6 w-6 p-0"
                          >
                            {copiedId === 'Subnet ID' ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Blockchain ID */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400">Blockchain ID</label>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400">
                            {truncateHash(subnet.blockchainId, 12)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(subnet.blockchainId, 'Blockchain ID')}
                            className="h-6 w-6 p-0"
                          >
                            {copiedId === 'Blockchain ID' ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Network */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400">Network</label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white capitalize">{subnet.network}</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400">Created</label>
                        <div className="text-sm text-gray-300">
                          {formatDate(subnet.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Deployment Details */}
                    {subnet.deployment && (
                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Deployment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Transaction Hash</label>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-800 px-2 py-1 rounded text-yellow-400">
                                {truncateHash(subnet.deployment.transactionHash, 8)}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(subnet.deployment.transactionHash, 'Transaction Hash')}
                                className="h-6 w-6 p-0"
                              >
                                {copiedId === 'Transaction Hash' ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Block Number</label>
                            <div className="text-sm text-white">
                              {subnet.deployment.blockNumber || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Gas Used</label>
                            <div className="text-sm text-white">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
