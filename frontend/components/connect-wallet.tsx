'use client'

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { connectWallet, disconnectWallet } from '@/lib/slices/walletSlice'
import { Wallet, LogOut, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function ConnectWallet() {
  const dispatch = useDispatch()
  const { isConnected, isConnecting, address, error } = useSelector((state: RootState) => state.wallet)

  const handleConnect = async () => {
    try {
      await dispatch(connectWallet() as any)
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  const handleDisconnect = async () => {
    try {
      await dispatch(disconnectWallet() as any)
      toast.success('Wallet disconnected')
    } catch (error: any) {
      toast.error('Failed to disconnect wallet')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnecting) {
    return (
      <button className="glass-button flex items-center gap-2" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="glass px-4 py-1 rounded-lg border border-1">
          <span className="text-sm text-gray-300">{formatAddress(address)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="glass-button flex items-center gap-2 text-red-400 hover:text-red-300 border border-1"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="glass-button flex items-center gap-2 animate-pulse-glow border border-1 py-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  )
}
