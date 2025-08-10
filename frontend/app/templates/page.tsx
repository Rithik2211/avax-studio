'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { 
  fetchTemplates, 
  fetchUserTemplates, 
  loadTemplate,
  saveTemplate,
  Template
} from '@/lib/slices/templateSlice'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  Plus,
  User,
  Globe,
  Settings,
  Heart,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
  const dispatch = useDispatch()
  const { 
    templates, 
    userTemplates, 
    selectedTemplate, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.templates)
  const { address } = useSelector((state: RootState) => state.wallet)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVM, setFilterVM] = useState('all')
  const [showUserTemplates, setShowUserTemplates] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'private' | 'public'
  })

  useEffect(() => {
    setIsClient(true)
    dispatch(fetchTemplates() as any)
    // For demo, skip user templates since wallet addresses aren't UUIDs
    // if (address) {
    //   dispatch(fetchUserTemplates(address) as any)
    // }
  }, [dispatch, address])

  const handleLoadTemplate = async (templateId: string) => {
    try {
      await dispatch(loadTemplate(templateId) as any)
      toast.success('Template loaded successfully!')
      // Navigate to builder with loaded template
      window.location.href = '/builder'
    } catch (error: any) {
      toast.error(error.message || 'Failed to load template')
    }
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      // Add userId and fix the data structure for backend
      const templateToSave = {
        ...templateData,
        userId: address || 'demo-user-' + Date.now(), // Use wallet address or generate demo user ID
        config: templateData.template_config, // Backend expects 'config' not 'template_config'
        vmType: templateData.vm_type // Backend expects 'vmType' not 'vm_type'
      }
      
      await dispatch(saveTemplate(templateToSave) as any)
      toast.success('Template saved successfully!')
      setShowCreateModal(false)
      
      // Refresh templates list
      dispatch(fetchTemplates() as any)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template')
    }
  }

  // Ensure templates and userTemplates are arrays with error handling
  const templatesArray = Array.isArray(templates) ? templates : []
  const userTemplatesArray = Array.isArray(userTemplates) ? userTemplates : []
  
  // Add dummy data for demo purposes
  const dummyTemplates: Template[] = [
    {
      id: 'demo-1',
      user_id: 'demo-user',
      name: 'DeFi Starter Template',
      description: 'Pre-configured subnet template for DeFi applications with optimized gas settings',
      category: 'defi',
      visibility: 'public',
      template_config: {
        vm_type: 'evm',
        gas_price: 225000000000,
        governance: { threshold: 51, votingPeriod: 168 },
        initial_supply: 1000000000
      },
      vm_type: 'evm',
      usage_count: 15,
      rating: 4.5,
      tags: ['defi', 'evm', 'starter'],
      created_at: '2025-01-15T10:30:00.000Z',
      updated_at: '2025-01-15T10:30:00.000Z',
      user_profiles: { id: 'demo-user', full_name: 'Subnet Admin' }
    },
    {
      id: 'demo-2',
      user_id: 'demo-user',
      name: 'Gaming Subnet Template',
      description: 'High-performance subnet optimized for gaming applications with low latency',
      category: 'gaming',
      visibility: 'public',
      template_config: {
        vm_type: 'evm',
        gas_price: 150000000000,
        governance: { threshold: 67, votingPeriod: 72 },
        initial_supply: 500000000
      },
      vm_type: 'evm',
      usage_count: 8,
      rating: 4.2,
      tags: ['gaming', 'evm', 'performance'],
      created_at: '2025-01-10T14:20:00.000Z',
      updated_at: '2025-01-10T14:20:00.000Z',
      user_profiles: { id: 'demo-user', full_name: 'Game Dev' }
    },
    {
      id: 'demo-3',
      user_id: 'demo-user',
      name: 'NFT Marketplace Template',
      description: 'Specialized subnet for NFT marketplaces with enhanced storage capabilities',
      category: 'nft',
      visibility: 'public',
      template_config: {
        vm_type: 'evm',
        gas_price: 300000000000,
        governance: { threshold: 51, votingPeriod: 168 },
        initial_supply: 2000000000
      },
      vm_type: 'evm',
      usage_count: 12,
      rating: 4.7,
      tags: ['nft', 'evm', 'marketplace'],
      created_at: '2025-01-05T09:15:00.000Z',
      updated_at: '2025-01-05T09:15:00.000Z',
      user_profiles: { id: 'demo-user', full_name: 'NFT Creator' }
    }
  ]

  // Use dummy data if no real templates are available
  const availableTemplates = showUserTemplates 
    ? (userTemplatesArray.length > 0 ? userTemplatesArray : dummyTemplates)
    : (templatesArray.length > 0 ? templatesArray : dummyTemplates)

  const filteredTemplates = availableTemplates.filter(template => {
    try {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase())
      // Use vm_type from template_config or root level
      const templateVMType = template.template_config?.vm_type || template.vm_type
      const matchesVM = filterVM === 'all' || templateVMType === filterVM
      return matchesSearch && matchesVM
    } catch (error) {
      console.error('Error filtering template:', error, template)
      return false
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navbar currentPage="templates" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[120px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-red-500">Template Library</h1>
            <p className="text-gray-300">
              Browse and use pre-configured subnet templates from the community
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowUserTemplates(!showUserTemplates)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {showUserTemplates ? 'All Templates' : 'My Templates'}
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 border border-1"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card mb-8 bg-transparent border border-1">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterVM}
                onChange={(e) => setFilterVM(e.target.value)}
                className="glass px-3 py-2 rounded-lg"
              >
                <option value="all">All VM Types</option>
                <option value="EVM">EVM</option>
                <option value="SpacesVM">SpacesVM</option>
                <option value="CustomVM">CustomVM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-gray-400">
              {showUserTemplates 
                ? "You haven't created any templates yet." 
                : "No templates match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="glass-card group hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-400">{template.vm_type?.toUpperCase()} VM</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{template.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {template.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {template.usage_count}
                    </span>
                    <span>By {template.user_profiles?.full_name || 'Unknown'}</span>
                  </div>
                  <span className="text-xs">
                    {isClient ? new Date(template.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }) : '01/15/2025'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLoadTemplate(template.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Create New Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <Input 
                  placeholder="Enter template name" 
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  placeholder="Describe your template..."
                  className="w-full glass px-3 py-2 rounded-lg border border-white/20 resize-none h-20"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="public" 
                  checked={templateForm.visibility === 'public'}
                  onChange={(e) => setTemplateForm({
                    ...templateForm, 
                    visibility: e.target.checked ? 'public' : 'private'
                  })}
                />
                <label htmlFor="public" className="text-sm">Make template public</label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setTemplateForm({ name: '', description: '', visibility: 'private' })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveTemplate({
                  name: templateForm.name || 'New Template',
                  description: templateForm.description || 'Template description',
                  template_config: { 
                    vm_type: 'evm',
                    gas_price: 225000000000,
                    governance: { threshold: 51, votingPeriod: 168 },
                    initial_supply: 1000000000
                  },
                  vm_type: 'evm',
                  category: 'general',
                  visibility: templateForm.visibility || 'private',
                  tags: ['new', 'template']
                })}
                className="flex-1"
              >
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
