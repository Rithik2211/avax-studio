'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { 
  startMonitoring, 
  fetchMetrics, 
  addLog 
} from '@/lib/slices/monitoringSlice'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Activity, 
  Users, 
  BarChart3, 
  Clock, 
  Wifi, 
  WifiOff,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function MonitorPage() {
  const dispatch = useDispatch()
  const { 
    subnetId, 
    metrics, 
    logs, 
    isMonitoring, 
    error 
  } = useSelector((state: RootState) => state.monitoring)
  
  const [inputSubnetId, setInputSubnetId] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh && subnetId && isMonitoring) {
      interval = setInterval(() => {
        dispatch(fetchMetrics(subnetId) as any)
      }, refreshInterval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, subnetId, isMonitoring, refreshInterval, dispatch])

  const handleStartMonitoring = async () => {
    if (!inputSubnetId.trim()) {
      toast.error('Please enter a subnet ID')
      return
    }

    try {
      await dispatch(startMonitoring(inputSubnetId) as any)
      toast.success('Monitoring started successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start monitoring')
    }
  }

  const handleRefresh = () => {
    if (subnetId) {
      dispatch(fetchMetrics(subnetId) as any)
      toast.success('Metrics refreshed!')
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'text-green-400'
      case 'yellow': return 'text-yellow-400'
      case 'red': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'green': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'yellow': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'red': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <WifiOff className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navbar currentPage="monitor" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[120px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-red-500">Subnet Monitoring</h1>
            <p className="text-gray-300">
              Real-time monitoring and analytics for your Avalanche subnets
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
            </Button>
          </div>
        </div>

        {/* Subnet ID Input */}
        {!subnetId && (
          <div className="glass-card mb-8 bg-transparent border border-1">
            <h3 className="text-lg font-semibold mb-4">Start Monitoring</h3>
            <div className="flex gap-4">
              <Input
                placeholder="Enter subnet ID..."
                value={inputSubnetId}
                onChange={(e) => setInputSubnetId(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleStartMonitoring}
                className="flex items-center gap-2 border border-1"
              >
                <Wifi className="w-4 h-4" />
                Start Monitoring
              </Button>
            </div>
          </div>
        )}

        {/* Monitoring Dashboard */}
        {subnetId && metrics && (
          <>
            {/* Status Bar */}
            <div className="glass-card mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getHealthIcon(metrics.health)}
                    <span className={`font-semibold ${getHealthColor(metrics.health)}`}>
                      {metrics.health.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-300">
                    Subnet: {subnetId.slice(0, 8)}...{subnetId.slice(-8)}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-300">
                    Last Update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Refresh:</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    className="glass px-2 py-1 rounded text-sm"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Block Height */}
              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Block Height</h3>
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold">{metrics.blockHeight.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Current block</p>
              </div>

              {/* TPS */}
              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">TPS</h3>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">{metrics.tps}</p>
                <p className="text-xs text-gray-400 mt-1">Transactions per second</p>
              </div>

              {/* Validators */}
              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Validators</h3>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold">{metrics.validators.length}</p>
                <p className="text-xs text-gray-400 mt-1">Active validators</p>
              </div>

              {/* Health Status */}
              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Health</h3>
                  {getHealthIcon(metrics.health)}
                </div>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health)}`}>
                  {metrics.health.toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">System status</p>
              </div>
            </div>

            {/* Validators Table */}
            <div className="glass-card mb-8">
              <h3 className="text-lg font-semibold mb-4">Validators</h3>
              {metrics.validators.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No validators found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Node ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Weight</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Start Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">End Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Uptime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.validators.map((validator, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3 px-4 text-sm">
                            <span className="font-mono">
                              {validator.nodeID.slice(0, 8)}...{validator.nodeID.slice(-8)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{validator.weight}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(parseInt(validator.startTime) * 1000).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(parseInt(validator.endTime) * 1000).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="flex items-center gap-1">
                              {parseFloat(validator.uptime) > 0.9 ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                              )}
                              {(parseFloat(validator.uptime) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Logs */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Logs</h3>
                <Button
                  onClick={() => dispatch({ type: 'monitoring/clearLogs' })}
                  variant="outline"
                  size="sm"
                >
                  Clear Logs
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No logs available</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded bg-white/5">
                        <Clock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{log}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="glass-card border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
