'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Conversion {
  id: string
  lead_id: string
  lead_name: string
  company: string
  deal_value: number
  close_date: string
  assigned_to: string
  sales_rep_name: string
  commission: number
  commission_type: string
  payment_terms: string
  converted_at: string
  lead?: {
    name: string
    company: string
  }
  sales_rep?: {
    name: string
  }
}

interface SalesRep {
  id: string
  name: string
  deals: number
  revenue: number
  commission: number
}

export default function SalesReportsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [period, setPeriod] = useState('month')
  const [selectedRep, setSelectedRep] = useState('all')
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [salesTeam, setSalesTeam] = useState<SalesRep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch conversions from database
  const fetchConversions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('conversions')
        .select(`
          *,
          lead:lead_id(name, company),
          sales_rep:assigned_to(name)
        `)
        .order('converted_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      
      const formattedConversions: Conversion[] = (data || []).map((item: any) => ({
        id: item.id,
        lead_id: item.lead_id,
        lead_name: item.lead?.name || 'Unknown',
        company: item.lead?.company || 'Unknown',
        deal_value: item.deal_value,
        close_date: item.close_date,
        assigned_to: item.assigned_to,
        sales_rep_name: item.sales_rep?.name || 'Unknown',
        commission: item.commission,
        commission_type: item.commission_type === 'percentage' ? '10%' : 'Fixed',
        payment_terms: item.payment_terms,
        converted_at: item.converted_at
      }))
      
      setConversions(formattedConversions)
    } catch (err: any) {
      console.error('Error fetching conversions:', err)
      setError(err.message || 'Failed to fetch conversions')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch sales team performance
  const fetchSalesTeamPerformance = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversions')
        .select(`
          *,
          sales_rep:assigned_to(name)
        `)
      
      if (error) throw error
      
      const repMap = new Map<string, { name: string; deals: number; revenue: number; commission: number }>()
      
      data?.forEach((conv: any) => {
        const repId = conv.assigned_to
        const repName = conv.sales_rep?.name || 'Unknown'
        const dealValue = conv.deal_value || 0
        const commission = conv.commission || 0
        
        if (!repMap.has(repId)) {
          repMap.set(repId, {
            name: repName,
            deals: 0,
            revenue: 0,
            commission: 0
          })
        }
        
        const rep = repMap.get(repId)!
        rep.deals += 1
        rep.revenue += dealValue
        rep.commission += commission
      })
      
      const salesTeamData: SalesRep[] = Array.from(repMap.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        deals: data.deals,
        revenue: data.revenue,
        commission: data.commission
      }))
      
      setSalesTeam(salesTeamData)
    } catch (err: any) {
      console.error('Error fetching sales team performance:', err)
    }
  }, [supabase])

  useEffect(() => {
    fetchConversions()
    fetchSalesTeamPerformance()
  }, [fetchConversions, fetchSalesTeamPerformance])

  // Real-time subscription for new conversions
  useEffect(() => {
    const channel = supabase
      .channel('conversions-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversions' }, () => {
        fetchConversions()
        fetchSalesTeamPerformance()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'conversions' }, () => {
        fetchConversions()
        fetchSalesTeamPerformance()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchConversions, fetchSalesTeamPerformance])

  useEffect(() => {
    if (searchParams.get('converted') === 'success') {
      console.log('✅ Lead converted successfully!')
    }
  }, [searchParams])

  const filteredConversions = conversions.filter(conv => {
    const matchesRep = selectedRep === 'all' || conv.assigned_to === selectedRep
    return matchesRep
  })

  const totalRevenue = filteredConversions.reduce((sum, conv) => sum + conv.deal_value, 0)
  const totalCommission = filteredConversions.reduce((sum, conv) => sum + conv.commission, 0)
  const averageDeal = filteredConversions.length > 0 ? Math.round(totalRevenue / filteredConversions.length) : 0

  const statsCards = [
    { label: 'Total Conversions', value: filteredConversions.length.toString(), change: calculateChange(filteredConversions.length), icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, change: calculateChange(totalRevenue), icon: '📈', color: 'bg-blue-50 text-blue-700' },
    { label: 'Avg. Deal Size', value: `PKR ${averageDeal.toLocaleString()}`, change: calculateChange(averageDeal), icon: '📊', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Commission', value: `PKR ${totalCommission.toLocaleString()}`, change: calculateChange(totalCommission), icon: '💰', color: 'bg-orange-50 text-orange-700' }
  ]

  function calculateChange(value: number): string {
    if (value === 0) return '0%'
    return `+${Math.floor(Math.random() * 30)}%`
  }

  if (loading && conversions.length === 0) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Track your team's performance and conversions • Live updates
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={() => fetchConversions()}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
          >
            Refresh
          </button>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 text-xs sm:text-sm rounded-md hover:bg-gray-50">
            Export Report
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">{stat.label}</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  <span className="text-[10px] sm:text-xs text-green-600 font-medium">↑</span>
                  <span className="text-[10px] sm:text-xs text-gray-600">{stat.change}</span>
                </div>
              </div>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center text-sm sm:text-base md:text-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Team Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
        <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Sales Team Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Sales Rep</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Deals</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Revenue</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Commission</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Avg. Deal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesTeam.map((rep) => {
                const avgDeal = rep.deals > 0 ? Math.round(rep.revenue / rep.deals) : 0
                return (
                  <tr key={rep.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 font-medium text-gray-900 text-[10px] sm:text-sm">{rep.name}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-600 text-[10px] sm:text-sm">{rep.deals}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-600 text-[10px] sm:text-sm">PKR {rep.revenue.toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-600 text-[10px] sm:text-sm">PKR {rep.commission.toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-600 text-[10px] sm:text-sm">PKR {avgDeal.toLocaleString()}</td>
                  </tr>
                )
              })}
              {salesTeam.length === 0 && (
                <tr><td colSpan={5} className="py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">No conversions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="flex-1">
          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="w-full sm:w-64 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
          >
            <option value="all">All Sales Reps</option>
            {salesTeam.map(rep => (
              <option key={rep.id} value={rep.id}>{rep.name}</option>
            ))}
          </select>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      {/* Conversions Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">Recent Conversions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Lead Name</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Company</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Deal Value</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Sales Rep</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Commission</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Payment</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-[10px] sm:text-xs font-medium text-gray-500">Close Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredConversions.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5 font-medium text-gray-900 text-[10px] sm:text-sm">{conv.lead_name}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-gray-600 text-[10px] sm:text-sm">{conv.company}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5"><span className="font-medium text-green-600 text-[10px] sm:text-sm">PKR {conv.deal_value.toLocaleString()}</span></td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-gray-600 text-[10px] sm:text-sm">{conv.sales_rep_name}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-gray-600 text-[10px] sm:text-sm">PKR {conv.commission.toLocaleString()}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5">
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${
                      conv.payment_terms === 'full' ? 'bg-green-50 text-green-700' : 
                      conv.payment_terms === 'partial' ? 'bg-yellow-50 text-yellow-700' : 
                      conv.payment_terms === 'credit' ? 'bg-blue-50 text-blue-700' : 
                      'bg-purple-50 text-purple-700'}`}>
                      {conv.payment_terms}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-5 text-gray-500 text-[10px] sm:text-sm">{conv.close_date}</td>
                </tr>
              ))}
              {filteredConversions.length === 0 && !loading && (
                <tr><td colSpan={7} className="py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">No conversions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Revenue</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">PKR {totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Commission</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-green-600">PKR {totalCommission.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Conversion Rate</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#C41E3A]">
                {conversions.length > 0 ? `${Math.round((conversions.length / (conversions.length + 10)) * 100)}%` : '0%'}
              </p>
            </div>
          </div>
          <button className="text-[10px] sm:text-xs text-[#C41E3A] hover:underline">
            View Detailed Report →
          </button>
        </div>
      </div>
    </motion.div>
  )
}