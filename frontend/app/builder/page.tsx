'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { 
  setNodes, 
  setEdges, 
  addNode, 
  updateNode, 
  setSelectedNode,
  updateConfig,
  deploySubnet 
} from '@/lib/slices/subnetSlice'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import { ConnectWallet } from '@/components/connect-wallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  Users, 
  Coins, 
  Shield, 
  Play, 
  Save,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Custom Node Types
const VMNode = ({ data }: { data: any }) => (
  <div className="glass-card p-4 min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Settings className="w-4 h-4 text-blue-400" />
      <span className="font-semibold">VM Type</span>
    </div>
    <div className="text-sm text-gray-300">{data.vmType}</div>
  </div>
)

const ValidatorsNode = ({ data }: { data: any }) => (
  <div className="glass-card p-4 min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Users className="w-4 h-4 text-green-400" />
      <span className="font-semibold">Validators</span>
    </div>
    <div className="text-sm text-gray-300">{data.count} validators</div>
  </div>
)

const TokenomicsNode = ({ data }: { data: any }) => (
  <div className="glass-card p-4 min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Coins className="w-4 h-4 text-yellow-400" />
      <span className="font-semibold">Tokenomics</span>
    </div>
    <div className="text-sm text-gray-300">
      Supply: {data.supply}
      <br />
      Gas: {data.gasPrice}
    </div>
  </div>
)

const GovernanceNode = ({ data }: { data: any }) => (
  <div className="glass-card p-4 min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="w-4 h-4 text-purple-400" />
      <span className="font-semibold">Governance</span>
    </div>
    <div className="text-sm text-gray-300">
      {data.enabled ? 'Enabled' : 'Disabled'}
    </div>
  </div>
)

const nodeTypes: NodeTypes = {
  vmNode: VMNode,
  validatorsNode: ValidatorsNode,
  tokenomicsNode: TokenomicsNode,
  governanceNode: GovernanceNode,
}

export default function BuilderPage() {
  const dispatch = useDispatch()
  const { 
    nodes: reduxNodes, 
    edges: reduxEdges, 
    selectedNode, 
    config, 
    isDeploying, 
    deploymentStatus,
    deploymentResult 
  } = useSelector((state: RootState) => state.subnet)
  
  const [nodes, setNodesState, onNodesChange] = useNodesState(reduxNodes)
  const [edges, setEdgesState, onEdgesChange] = useEdgesState(reduxEdges)
  const [showSidebar, setShowSidebar] = useState(false)

  // Sync with Redux
  useEffect(() => {
    setNodesState(reduxNodes)
    setEdgesState(reduxEdges)
  }, [reduxNodes, reduxEdges, setNodesState, setEdgesState])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges)
      setEdgesState(newEdges)
      dispatch(setEdges(newEdges))
    },
    [edges, setEdgesState, dispatch]
  )

  const onNodeClick = useCallback((event: any, node: Node) => {
    dispatch(setSelectedNode(node))
    setShowSidebar(true)
  }, [dispatch])

  const addNodeToFlow = (type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: `${type}Node`,
      position,
      data: getDefaultData(type),
    }
    
    const updatedNodes = [...nodes, newNode]
    setNodesState(updatedNodes)
    dispatch(setNodes(updatedNodes))
  }

  const getDefaultData = (type: string) => {
    switch (type) {
      case 'vm':
        return { vmType: 'EVM' }
      case 'validators':
        return { count: 3 }
      case 'tokenomics':
        return { supply: '1000000000', gasPrice: '25000000000' }
      case 'governance':
        return { enabled: false }
      default:
        return {}
    }
  }

  const handleDeploy = async () => {
    try {
      await dispatch(deploySubnet(config) as any)
      if (deploymentStatus === 'success') {
        toast.success('Subnet deployed successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Deployment failed')
    }
  }

  const handleSaveTemplate = () => {
    // TODO: Implement template saving
    toast.success('Template saved!')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <nav className="glass h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text">
            Subnet Studio
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <span className="text-white">Builder</span>
            <Link href="/templates" className="text-gray-300 hover:text-white transition-colors">
              Templates
            </Link>
          </div>
        </div>
        <ConnectWallet />
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Toolbar */}
        <div className="w-64 glass p-4 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Components</h3>
            <div className="space-y-2">
              <Button
                onClick={() => addNodeToFlow('vm', { x: 100, y: 100 })}
                className="w-full justify-start"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                VM Type
              </Button>
              <Button
                onClick={() => addNodeToFlow('validators', { x: 100, y: 200 })}
                className="w-full justify-start"
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Validators
              </Button>
              <Button
                onClick={() => addNodeToFlow('tokenomics', { x: 100, y: 300 })}
                className="w-full justify-start"
                variant="outline"
              >
                <Coins className="w-4 h-4 mr-2" />
                Tokenomics
              </Button>
              <Button
                onClick={() => addNodeToFlow('governance', { x: 100, y: 400 })}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Governance
              </Button>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Deploy to Testnet
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveTemplate}
                variant="outline"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>

          {/* Deployment Status */}
          {deploymentStatus !== 'idle' && (
            <div className="border-t border-white/20 pt-4">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="flex items-center gap-2">
                {deploymentStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : deploymentStatus === 'error' ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                )}
                <span className="text-sm capitalize">{deploymentStatus}</span>
              </div>
            </div>
          )}
        </div>

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Configuration Sidebar */}
        {showSidebar && selectedNode && (
          <div className="w-80 glass p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configure {selectedNode.type}</h3>
              <Button
                onClick={() => setShowSidebar(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {selectedNode.type === 'vmNode' && (
                <div>
                  <Label>VM Type</Label>
                  <select
                    value={selectedNode.data.vmType}
                    onChange={(e) => {
                      const updatedNode = {
                        ...selectedNode,
                        data: { ...selectedNode.data, vmType: e.target.value }
                      }
                      const updatedNodes = nodes.map(node =>
                        node.id === selectedNode.id ? updatedNode : node
                      )
                      setNodesState(updatedNodes)
                      dispatch(setNodes(updatedNodes))
                      dispatch(updateConfig({ vmType: e.target.value }))
                    }}
                    className="w-full glass px-3 py-2 rounded-lg mt-1"
                  >
                    <option value="EVM">EVM</option>
                    <option value="SpacesVM">SpacesVM</option>
                    <option value="CustomVM">CustomVM</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'validatorsNode' && (
                <div>
                  <Label>Number of Validators</Label>
                  <Input
                    type="number"
                    value={selectedNode.data.count}
                    onChange={(e) => {
                      const updatedNode = {
                        ...selectedNode,
                        data: { ...selectedNode.data, count: parseInt(e.target.value) }
                      }
                      const updatedNodes = nodes.map(node =>
                        node.id === selectedNode.id ? updatedNode : node
                      )
                      setNodesState(updatedNodes)
                      dispatch(setNodes(updatedNodes))
                    }}
                    className="mt-1"
                  />
                </div>
              )}

              {selectedNode.type === 'tokenomicsNode' && (
                <div className="space-y-3">
                  <div>
                    <Label>Total Supply</Label>
                    <Input
                      type="text"
                      value={selectedNode.data.supply}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, supply: e.target.value }
                        }
                        const updatedNodes = nodes.map(node =>
                          node.id === selectedNode.id ? updatedNode : node
                        )
                        setNodesState(updatedNodes)
                        dispatch(setNodes(updatedNodes))
                        dispatch(updateConfig({ 
                          tokenomics: { ...config.tokenomics, supply: e.target.value }
                        }))
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Gas Price (nAVAX)</Label>
                    <Input
                      type="text"
                      value={selectedNode.data.gasPrice}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, gasPrice: e.target.value }
                        }
                        const updatedNodes = nodes.map(node =>
                          node.id === selectedNode.id ? updatedNode : node
                        )
                        setNodesState(updatedNodes)
                        dispatch(setNodes(updatedNodes))
                        dispatch(updateConfig({ 
                          tokenomics: { ...config.tokenomics, gasPrice: e.target.value }
                        }))
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'governanceNode' && (
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedNode.data.enabled}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, enabled: e.target.checked }
                        }
                        const updatedNodes = nodes.map(node =>
                          node.id === selectedNode.id ? updatedNode : node
                        )
                        setNodesState(updatedNodes)
                        dispatch(setNodes(updatedNodes))
                        dispatch(updateConfig({ 
                          governance: { ...config.governance, enabled: e.target.checked }
                        }))
                      }}
                    />
                    Enable Governance
                  </Label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
