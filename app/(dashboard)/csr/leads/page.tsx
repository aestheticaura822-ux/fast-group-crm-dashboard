'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  type: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not_interested'
  source: string
  assigned_to: string
  created_by: string
  deal_value: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export default function CSRLeadsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'warm' as 'hot' | 'warm' | 'cold',
    status: 'new' as 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not_interested',
    source: 'manual',
    notes: ''
  })

  // Load leads directly from Supabase
  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (typeFilter) {
        query = query.eq('type', typeFilter)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setLeads(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load leads')
      console.error('Error loading leads:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, typeFilter, statusFilter])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  // REAL-TIME SUBSCRIPTION
  useEffect(() => {
    console.log('Setting up real-time subscription for leads...')
    
    const channel = supabase
      .channel('leads-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('📡 Real-time event:', payload.eventType, payload.new)
          loadLeads()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadLeads])

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Create lead directly in Supabase
  const handleAddLead = async () => {
    if (!leadForm.name || !leadForm.email || !leadForm.company) {
      alert('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          company: leadForm.company,
          type: leadForm.type,
          status: leadForm.status,
          source: leadForm.source || 'manual',
          notes: leadForm.notes,
          assigned_to: user?.id,
          created_by: user?.id
        }])
      
      if (error) throw error
      
      setShowAddModal(false)
      resetForm()
      loadLeads()
    } catch (err: any) {
      console.error('Error creating lead:', err)
      alert('Failed to create lead: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update lead directly in Supabase
  const handleUpdateLead = async () => {
    if (!editingLead) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          company: leadForm.company,
          type: leadForm.type,
          status: leadForm.status,
          source: leadForm.source,
          notes: leadForm.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLead.id)
      
      if (error) throw error
      
      setEditingLead(null)
      setShowAddModal(false)
      resetForm()
      loadLeads()
    } catch (err: any) {
      console.error('Error updating lead:', err)
      alert('Failed to update lead: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update status directly in Supabase
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      console.log(`🔄 Updating lead ${id} status to ${status}`)
      
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      console.log(`✅ Status updated to ${status}`)
    } catch (err: any) {
      console.error('Error updating lead status:', err)
      alert('Failed to update lead status: ' + err.message)
    }
  }

  // Update type directly in Supabase
  const handleUpdateType = async (id: string, type: 'hot' | 'warm' | 'cold') => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          type: type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
    } catch (err: any) {
      console.error('Error updating lead type:', err)
      alert('Failed to update lead type: ' + err.message)
    }
  }

  // Delete lead directly in Supabase
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err: any) {
      console.error('Error deleting lead:', err)
      alert('Failed to delete lead: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLeadForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      type: 'warm',
      status: 'new',
      source: 'manual',
      notes: ''
    })
  }

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead)
    setLeadForm({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      company: lead.company || '',
      type: lead.type,
      status: lead.status,
      source: lead.source,
      notes: lead.notes || ''
    })
    setShowAddModal(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-700',
      'contacted': 'bg-purple-100 text-purple-700',
      'followup': 'bg-yellow-100 text-yellow-700',
      'interested': 'bg-green-100 text-green-700',
      'converted': 'bg-emerald-100 text-emerald-700',
      'not_interested': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'hot': 'bg-red-100 text-red-700',
      'warm': 'bg-yellow-100 text-yellow-700',
      'cold': 'bg-blue-100 text-blue-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            {filteredLeads.length} leads • Live updates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm()
              setEditingLead(null)
              setShowAddModal(true)
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528] flex items-center gap-1"
          >
            <span>+</span> Add New Lead
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-sm mx-4 sm:mx-0">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mx-4 sm:mx-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value="">All Types</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="followup">Follow Up</option>
              <option value="interested">Interested</option>
              <option value="converted">Converted</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-start sm:justify-end gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
            <span>{filteredLeads.length} leads</span>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mx-4 sm:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Name</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Contact</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Company</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Type</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Created</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    <Link href={`/csr/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-[#C41E3A] text-xs sm:text-sm">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    <div className="text-gray-600 text-[10px] sm:text-xs">{lead.email}</div>
                    <div className="text-gray-400 text-[9px] sm:text-[10px]">{lead.phone}</div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-600 text-[10px] sm:text-xs">{lead.company}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    <select
                      value={lead.type}
                      onChange={(e) => handleUpdateType(lead.id, e.target.value as 'hot' | 'warm' | 'cold')}
                      className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-0 font-medium cursor-pointer ${getTypeColor(lead.type)}`}
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-0 font-medium cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="followup">Follow Up</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-500 text-[10px] sm:text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => openEditModal(lead)}
                        className="text-[10px] sm:text-xs text-[#C41E3A] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-[10px] sm:text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📭</div>
            <p className="text-xs sm:text-sm text-gray-400">No leads found</p>
            <button
              onClick={() => {
                resetForm()
                setEditingLead(null)
                setShowAddModal(true)
              }}
              className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#C41E3A] hover:underline"
            >
              Add your first lead
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Lead Modal - Responsive */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Name *</label>
                    <input
                      type="text"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Company *</label>
                    <input
                      type="text"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Email *</label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Lead Type</label>
                    <select
                      value={leadForm.type}
                      onChange={(e) => setLeadForm({ ...leadForm, type: e.target.value as any })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                      value={leadForm.status}
                      onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as any })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="followup">Follow Up</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Source</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                  >
                    <option value="website">Website</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="maps">Google Maps</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    placeholder="Additional information..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={editingLead ? handleUpdateLead : handleAddLead}
                  disabled={!leadForm.name || !leadForm.email || !leadForm.company}
                  className="flex-1 px-3 sm:px-4 py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528] disabled:opacity-50"
                >
                  {editingLead ? 'Update Lead' : 'Add Lead'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingLead(null)
                    resetForm()
                  }}
                  className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}