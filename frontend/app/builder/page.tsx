'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './builder.css'
import { Navbar } from '@/components/navbar'
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
  XCircle,
  X,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Custom Node Components with proper handles
const VMNode = ({ data, selected }: { data: any; selected?: boolean }) => (
  <div className={`glass-card p-2 min-w-[150px] min-h-[50px] transition-all duration-200 ${selected ? 'ring-2 ring-blue-400' : ''}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className='flex flex-col items-start gap-1'>
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-[9px]">VM Type</span>
      </div>
      <div className="text-[8px] text-gray-300">{data.vmType}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
)

const ValidatorsNode = ({ data, selected }: { data: any; selected?: boolean }) => (
  <div className={`glass-card p-2 min-w-[150px] min-h-[50px] transition-all duration-200 ${selected ? 'ring-2 ring-green-400' : ''}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className='flex flex-col items-start gap-1'>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-green-400" />
        <span className="font-semibold text-[9px]">Validators</span>
      </div>
      <div className="text-[8px] text-gray-300">{data.count} validators</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
)

const TokenomicsNode = ({ data, selected }: { data: any; selected?: boolean }) => (
  <div className={`glass-card p-2 min-w-[150px] min-h-[50px] transition-all duration-200 ${selected ? 'ring-2 ring-yellow-400' : ''}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className='flex flex-col items-start gap-1'>
      <div className="flex items-center gap-2">
      <Coins className="w-4 h-4 text-yellow-400" />
        <span className="font-semibold text-[9px]">Tokenomics</span>
      </div>
      <div className="text-[8px] text-gray-300">Supply: {data.supply}
      <br />
      Gas: {data.gasPrice}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
)

const GovernanceNode = ({ data, selected }: { data: any; selected?: boolean }) => (
  <div className={`glass-card p-2 min-w-[150px] min-h-[50px] transition-all duration-200 ${selected ? 'ring-2 ring-purple-400' : ''}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className='flex flex-col items-start gap-1'>
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-[9px]">Governance</span>
      </div>
      <div className="text-[8px] text-gray-300">{data.enabled ? 'Enabled' : 'Disabled'}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
)

const nodeTypes: NodeTypes = {
  vmNode: VMNode,
  validatorsNode: ValidatorsNode,
  tokenomicsNode: TokenomicsNode,
  governanceNode: GovernanceNode,
}

function BuilderFlow() {
  const dispatch = useDispatch()
  const { 
    nodes: reduxNodes, 
    edges: reduxEdges, 
    selectedNode, 
    config, 
    isDeploying, 
    deploymentStatus,
    deploymentResult,
    error
  } = useSelector((state: RootState) => state.subnet)
  
  const { selectedTemplate } = useSelector((state: RootState) => state.templates)
  
  const [nodes, setNodesState, onNodesChange] = useNodesState(reduxNodes)
  const [edges, setEdgesState, onEdgesChange] = useEdgesState(reduxEdges)
  const [showSidebar, setShowSidebar] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // Sync with Redux
  useEffect(() => {
    setNodesState(reduxNodes)
    setEdgesState(reduxEdges)
  }, [reduxNodes, reduxEdges, setNodesState, setEdgesState])

  // Keep selectedNode in sync with actual node data
  useEffect(() => {
    if (selectedNode) {
      const actualNode = nodes.find(node => node.id === selectedNode.id)
      if (actualNode && JSON.stringify(actualNode.data) !== JSON.stringify(selectedNode.data)) {
        dispatch(setSelectedNode(actualNode))
      }
    }
  }, [nodes, selectedNode, dispatch])

  // Load template data when selectedTemplate changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.template_config) {
      const config = selectedTemplate.template_config
      
      // Create nodes from template data
      const templateNodes: Node[] = []
      
      // VM Node
      if (config.vm_type) {
        templateNodes.push({
          id: `vm-${Date.now()}`,
          type: 'vmNode',
          position: { x: 100, y: 100 },
          data: { vmType: config.vm_type.toUpperCase() }
        })
      }
      
      // Tokenomics Node
      if (config.initial_supply || config.gas_price) {
        templateNodes.push({
          id: `tokenomics-${Date.now()}`,
          type: 'tokenomicsNode',
          position: { x: 300, y: 100 },
          data: { 
            supply: config.initial_supply?.toString() || '1000000000',
            gasPrice: config.gas_price?.toString() || '25000000000'
          }
        })
      }
      
      // Governance Node
      if (config.governance) {
        templateNodes.push({
          id: `governance-${Date.now()}`,
          type: 'governanceNode',
          position: { x: 500, y: 100 },
          data: { 
            threshold: config.governance.threshold || 51,
            votingPeriod: config.governance.votingPeriod || 168
          }
        })
      }
      
      // Validators Node (default)
      templateNodes.push({
        id: `validators-${Date.now()}`,
        type: 'validatorsNode',
        position: { x: 100, y: 300 },
        data: { count: 3 }
      })
      
      // Set the nodes
      setNodesState(templateNodes)
      dispatch(setNodes(templateNodes))
      
      // Update config
      dispatch(updateConfig({
        name: selectedTemplate.name,
        vmType: config.vm_type,
        network: 'fuji',
        keyName: 'ewoq'
      }))
      
      toast.success(`Template "${selectedTemplate.name}" loaded successfully!`)
    }
  }, [selectedTemplate, dispatch, setNodesState])

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

  // Helper function to update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
    )
    setNodesState(updatedNodes)
    dispatch(setNodes(updatedNodes))
    
    // Update selected node if it's the one being modified
    if (selectedNode?.id === nodeId) {
      const updatedSelectedNode = updatedNodes.find(node => node.id === nodeId)
      if (updatedSelectedNode) {
        dispatch(setSelectedNode(updatedSelectedNode))
      }
    }
  }, [nodes, setNodesState, dispatch, selectedNode])

  const onNodeDragStop = useCallback((event: any, node: Node) => {
    const updatedNodes = nodes.map(n => 
      n.id === node.id ? { ...n, position: node.position } : n
    )
    setNodesState(updatedNodes)
    dispatch(setNodes(updatedNodes))
  }, [nodes, setNodesState, dispatch])

  const addNodeToFlow = (type: string) => {
    const position = reactFlowInstance ? 
      reactFlowInstance.screenToFlowPosition({
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      }) : { x: 100, y: 100 }

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
    if (nodes.length === 0) {
      toast.error('Please add at least one component to deploy')
      return
    }
    
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
    if (nodes.length === 0) {
      toast.error('Please add components before saving template')
      return
    }
    // TODO: Implement template saving
    toast.success('Template saved!')
  }

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId)
    const updatedEdges = edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    )
    setNodesState(updatedNodes)
    setEdgesState(updatedEdges)
    dispatch(setNodes(updatedNodes))
    dispatch(setEdges(updatedEdges))
    if (selectedNode?.id === nodeId) {
      setShowSidebar(false)
      dispatch(setSelectedNode(null))
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navbar currentPage="builder" />

      <div className="flex h-screen pt-16">
        {/* Toolbar */}
        <div className="w-64 glass p-4 flex flex-col gap-4 overflow-y-auto border-r border-white-1">
          <div>
            <h3 className="text-lg font-semibold mb-4">Components</h3>
            <div className="space-y-2">
              <Button
                onClick={() => addNodeToFlow('vm')}
                className="w-full justify-start"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                VM Type
              </Button>
              <Button
                onClick={() => addNodeToFlow('validators')}
                className="w-full justify-start"
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Validators
              </Button>
              <Button
                onClick={() => addNodeToFlow('tokenomics')}
                className="w-full justify-start"
                variant="outline"
              >
                <Coins className="w-4 h-4 mr-2" />
                Tokenomics
              </Button>
              <Button
                onClick={() => addNodeToFlow('governance')}
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
                disabled={isDeploying || nodes.length === 0}
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
                disabled={nodes.length === 0}
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
              <div className="flex items-center gap-2 mb-3">
                {deploymentStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : deploymentStatus === 'error' ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                )}
                <span className="text-sm capitalize">{deploymentStatus}</span>
              </div>
              
              {/* Deployment Progress */}
              {isDeploying && deploymentResult?.deploymentId && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">Deployment ID: {deploymentResult.deploymentId}</div>
                  <div className="text-xs text-blue-400">
                    {deploymentStatus === 'deploying' ? 'Using Docker deployment...' : 'Local CLI deployment...'}
                  </div>
                </div>
              )}
              
              {/* Success Details */}
              {deploymentStatus === 'success' && deploymentResult && (
                <div className="space-y-2 text-xs">
                  <div className="text-green-400">
                    ✅ Subnet deployed successfully!
                  </div>
                  {deploymentResult.subnetId && (
                    <div className="text-gray-300">
                      Subnet ID: {deploymentResult.subnetId}
                    </div>
                  )}
                  {deploymentResult.blockchainId && (
                    <div className="text-gray-300">
                      Blockchain ID: {deploymentResult.blockchainId}
                    </div>
                  )}
                  {deploymentResult.rpcUrl && (
                    <div className="text-gray-300">
                      RPC URL: {deploymentResult.rpcUrl}
                    </div>
                  )}
                </div>
              )}
              
              {/* Error Details */}
              {deploymentStatus === 'error' && (
                <div className="text-xs text-red-400">
                  {error || 'Deployment failed. Check logs for details.'}
                </div>
              )}
            </div>
          )}

          {/* Node Count */}
          <div className="border-t border-white/20 pt-4">
            <div className="text-sm text-gray-400">
              Nodes: {nodes.length} | Edges: {edges.length}
            </div>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-slate-900 via-black to-slate-900"
            connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 1 }}
            defaultEdgeOptions={{ 
              type: 'bezier curve',
              style: { stroke: '#6366f1', strokeWidth: 1 }
            }}
          >
            <Controls className="glass" />
            <Background 
              gap={20} 
              size={1} 
              color="#374151"
            />
            <MiniMap 
              className="glass"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.8)"
            />
          </ReactFlow>

          {/* Floating Action Button for Mobile */}
          <div className="md:hidden absolute bottom-4 right-4">
            <Button
              onClick={() => setShowSidebar(!showSidebar)}
              className="rounded-full w-12 h-12 p-0"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Configuration Sidebar */}
        {showSidebar && selectedNode && (
          <div className="w-80 glass p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configure {selectedNode.type?.replace('Node', '')}</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowSidebar(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedNode.type === 'vmNode' && (
                <div>
                  <Label>VM Type</Label>
                  <select
                    value={selectedNode.data.vmType}
                    onChange={(e) => {
                      updateNodeData(selectedNode.id, { vmType: e.target.value })
                      dispatch(updateConfig({ vmType: e.target.value }))
                    }}
                    className="w-full glass px-3 py-2 rounded-lg mt-1 border border-white/20 bg-white/10 text-white"
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
                      updateNodeData(selectedNode.id, { count: parseInt(e.target.value) || 0 })
                    }}
                    className="mt-1"
                    min="1"
                    max="100"
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
                        updateNodeData(selectedNode.id, { supply: e.target.value })
                        dispatch(updateConfig({ 
                          tokenomics: { ...config.tokenomics, supply: e.target.value }
                        }))
                      }}
                      className="mt-1"
                      placeholder="1000000000"
                    />
                  </div>
                  <div>
                    <Label>Gas Price (nAVAX)</Label>
                    <Input
                      type="text"
                      value={selectedNode.data.gasPrice}
                      onChange={(e) => {
                        updateNodeData(selectedNode.id, { gasPrice: e.target.value })
                        dispatch(updateConfig({ 
                          tokenomics: { ...config.tokenomics, gasPrice: e.target.value }
                        }))
                      }}
                      className="mt-1"
                      placeholder="25000000000"
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
                        updateNodeData(selectedNode.id, { enabled: e.target.checked })
                        dispatch(updateConfig({ 
                          governance: { ...config.governance, enabled: e.target.checked }
                        }))
                      }}
                      className="rounded border-white/20 bg-white/10"
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

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderFlow />
    </ReactFlowProvider>
  )
}
