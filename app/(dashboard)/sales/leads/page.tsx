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

export default function SalesLeadsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Fetch interested leads
  const fetchInterestedLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'interested')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('📋 Fetched interested leads:', data?.length || 0)
      setLeads(data || [])
    } catch (err: any) {
      console.error('Error fetching leads:', err)
      setError(err.message || 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchInterestedLeads()
  }, [fetchInterestedLeads])

  // REAL-TIME SUBSCRIPTION for interested leads
  useEffect(() => {
    console.log('Setting up real-time subscription for interested leads...')
    
    const channel = supabase
      .channel('interested-leads-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('🔄 Lead updated:', payload.old.status, '->', payload.new.status)
          
          if (payload.new.status === 'interested') {
            console.log('✅ New interested lead detected:', payload.new.name)
            fetchInterestedLeads()
          }
          else if (payload.old.status === 'interested' && payload.new.status !== 'interested') {
            console.log('❌ Lead no longer interested:', payload.new.name)
            fetchInterestedLeads()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          if (payload.new.status === 'interested') {
            console.log('🆕 New interested lead added:', payload.new.name)
            fetchInterestedLeads()
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for interested leads')
        }
      })

    return () => {
      console.log('Cleaning up subscription...')
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchInterestedLeads])

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === '' || lead.type === typeFilter
    
    return matchesSearch && matchesType
  })

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
      className="space-y-4 sm:space-y-6 px-4 sm:px-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ready to Convert</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            {filteredLeads.length} interested leads waiting for conversion • Live updates
          </p>
        </div>
        <button
          onClick={() => fetchInterestedLeads()}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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
              <option value="hot">Hot Leads</option>
              <option value="warm">Warm Leads</option>
              <option value="cold">Cold Leads</option>
            </select>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-start sm:justify-end gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
            <span>{filteredLeads.length} leads ready</span>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredLeads.map((lead) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-3 sm:p-4">
              {/* Lead Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{lead.name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">{lead.company}</p>
                </div>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${getTypeColor(lead.type)}`}>
                  {lead.type.toUpperCase()}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="text-gray-400">📧</span>
                  <span className="text-gray-600 truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-600">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="text-gray-400">📅</span>
                  <span className="text-gray-600">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Notes Preview */}
              {lead.notes && (
                <div className="mb-3 sm:mb-4 p-1.5 sm:p-2 bg-gray-50 rounded text-[10px] sm:text-xs text-gray-600 line-clamp-2">
                  📝 {lead.notes.substring(0, 80)}{lead.notes.length > 80 ? '...' : ''}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/sales/convert?id=${lead.id}`}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white text-[10px] sm:text-sm rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  Convert to Sale
                </Link>
                
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎯</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Leads Ready for Conversion</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            When CSR team marks leads as "interested", they will appear here for conversion.
          </p>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Interested leads will show up here automatically in real-time
          </div>
        </div>
      )}
    </motion.div>
  )
}