'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { 
  fetchTemplates, 
  fetchUserTemplates, 
  loadTemplate,
  saveTemplate 
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

  useEffect(() => {
    dispatch(fetchTemplates() as any)
    if (address) {
      dispatch(fetchUserTemplates(address) as any)
    }
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
      await dispatch(saveTemplate(templateData) as any)
      toast.success('Template saved successfully!')
      setShowCreateModal(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template')
    }
  }

  const filteredTemplates = (showUserTemplates ? userTemplates : templates).filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVM = filterVM === 'all' || template.config.vmType === filterVM
    return matchesSearch && matchesVM
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Navigation */}
      <Navbar currentPage="templates" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Template Library</h1>
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
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card mb-8">
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
                className="glass px-3 py-2 rounded-lg border border-white/20"
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
                    <p className="text-sm text-gray-400">{template.config.vmType} VM</p>
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
                      {template.downloads}
                    </span>
                    <span>By {template.author.slice(0, 6)}...{template.author.slice(-4)}</span>
                  </div>
                  <span className="text-xs">
                    {new Date(template.createdAt).toLocaleDateString()}
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
                <Input placeholder="Enter template name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  placeholder="Describe your template..."
                  className="w-full glass px-3 py-2 rounded-lg border border-white/20 resize-none h-20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" />
                <label htmlFor="public" className="text-sm">Make template public</label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveTemplate({
                  name: 'New Template',
                  description: 'Template description',
                  config: { vmType: 'EVM' },
                  author: address || '',
                  isPublic: false
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
