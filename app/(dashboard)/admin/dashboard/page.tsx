'use client'

import { useState, useEffect, useCallback } from 'react'
import { useReports } from '@/hooks/useReports'
import { useLeads, Lead } from '@/hooks/useLeads'
import { useUsers } from '@/hooks/useUsers'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DashboardStats {
  totalLeads: number
  todayLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  conversions: number
  conversionRate: number
  activeUsers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const { getDashboardStats } = useReports()
  const { getLeads, updateLead, deleteLead, createLead } = useLeads()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [dateRange, setDateRange] = useState('week')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chartData, setChartData] = useState<any>(null)

  // Lead Management States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'warm' as 'hot' | 'warm' | 'cold',
    status: 'new' as 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not_interested'
  })

  // Generate chart data from leads
  const generateChartData = useCallback(() => {
    const dates = []
    const counts = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.created_at).toDateString()
        return leadDate === date.toDateString()
      }).length
      
      counts.push(count)
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Leads',
          data: counts,
          borderColor: '#C41E3A',
          backgroundColor: 'rgba(196, 30, 58, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#C41E3A',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    })
  }, [leads])

  // Load initial data
  const loadDashboardData = useCallback(async () => {
    try {
      const statsData = await getDashboardStats()
setStats(statsData as any)
      const leadsData = await getLeads({ limit: 10, sort: 'created_at:desc' })
      setLeads(leadsData.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }, [getDashboardStats, getLeads])

  useEffect(() => {
    loadDashboardData()
  }, [dateRange, loadDashboardData])

  useEffect(() => {
    if (leads.length > 0) {
      generateChartData()
    } else {
      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Leads',
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#C41E3A',
            backgroundColor: 'rgba(196, 30, 58, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      })
    }
  }, [leads, generateChartData])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('custom-leads-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, async (payload) => {
        const newLead = payload.new as Lead
        setLeads(prevLeads => [newLead, ...prevLeads].slice(0, 10))
        setStats(prevStats => {
          if (!prevStats) return prevStats
          return {
            ...prevStats,
            totalLeads: (prevStats.totalLeads || 0) + 1,
            todayLeads: (prevStats.todayLeads || 0) + 1,
            ...(newLead.type === 'hot' && { hotLeads: (prevStats.hotLeads || 0) + 1 }),
            ...(newLead.type === 'warm' && { warmLeads: (prevStats.warmLeads || 0) + 1 }),
            ...(newLead.type === 'cold' && { coldLeads: (prevStats.coldLeads || 0) + 1 })
          }
        })
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 New Lead!', { body: `${newLead.name} - ${newLead.company || 'No company'}`, icon: '/favicon.ico' })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        const updatedLead = payload.new as Lead
        setLeads(prevLeads => prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== payload.old.id))
      })
      .subscribe()

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Lead Management Functions
  const handleAddLead = async () => {
    try {
      await createLead({ ...leadForm, source: 'manual' })
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error adding lead:', error)
      alert('Failed to add lead')
    }
  }

  const handleEditLead = async () => {
    if (!editingLead) return
    try {
      await updateLead(editingLead.id, leadForm)
      setEditingLead(null)
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Failed to update lead')
    }
  }

  const handleUpdateType = async (id: string, type: 'hot' | 'warm' | 'cold') => {
    try { await updateLead(id, { type }) } catch (error) { console.error(error) }
  }

  const handleUpdateStatus = async (id: string, status: any) => {
    try { await updateLead(id, { status }) } catch (error) { console.error(error) }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    try { await deleteLead(id) } catch (error) { console.error(error); alert('Failed to delete lead') }
  }

  const resetForm = () => { setLeadForm({ name: '', email: '', phone: '', type: 'warm', status: 'new' }) }
  const openEditModal = (lead: Lead) => {
    setEditingLead(lead)
    setLeadForm({ name: lead.name, email: lead.email || '', phone: lead.phone, type: lead.type, status: lead.status })
    setShowAddModal(true)
  }

  const todayLeadsCount = leads.filter(lead => new Date(lead.created_at).toDateString() === new Date().toDateString()).length

  const summaryMetrics = [
    { label: 'Total Leads', value: stats?.totalLeads || leads.length, change: '+12.5%', icon: '📊', realtime: true },
    { label: "Today's Leads", value: todayLeadsCount, change: '+8.2%', icon: '🔥', realtime: true },
    { label: 'Hot Leads', value: leads.filter(l => l.type === 'hot').length, change: '+5.1%', icon: '🔥', realtime: true },
    { label: 'Conversion Rate', value: stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '0%', change: '+5.1%', icon: '📈' }
  ]

  const getTypeColor = (type: string) => {
    const colors = { 'hot': 'bg-red-100 text-red-700', 'warm': 'bg-yellow-100 text-yellow-700', 'cold': 'bg-blue-100 text-blue-700' }
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-green-100 text-green-700', 'contacted': 'bg-purple-100 text-purple-700',
      'followup': 'bg-yellow-100 text-yellow-700', 'interested': 'bg-blue-100 text-blue-700',
      'converted': 'bg-emerald-100 text-emerald-700', 'not_interested': 'bg-gray-100 text-gray-700'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100">☰</button>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Live Updates • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-gray-500">Show:</span>
            <div className="flex items-center gap-1">
              {['Today', 'Week', 'Month'].map((range) => (
                <button key={range} onClick={() => setDateRange(range.toLowerCase())}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${
                    (range === 'Week' && dateRange === 'week') || (range === 'Today' && dateRange === 'today') || (range === 'Month' && dateRange === 'month')
                      ? 'bg-[#C41E3A] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {summaryMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5 relative overflow-hidden">
              {metric.realtime && (<div className="absolute top-2 right-2"><span className="flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span></span></div>)}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">{metric.label}</p>
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-gray-900">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1 sm:mt-2"><span className="text-[10px] sm:text-xs text-green-600 font-medium">↑</span><span className="text-[10px] sm:text-xs text-gray-600">{metric.change}</span></div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg flex items-center justify-center text-sm sm:text-base md:text-lg">{metric.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Lead Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Lead Distribution</h3>
            <div className="space-y-3 sm:space-y-4">
              {['hot', 'warm', 'cold'].map((type) => {
                const count = leads.filter(l => l.type === type).length
                const total = leads.length || 1
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                const colors = { 'hot': 'bg-red-500', 'warm': 'bg-yellow-500', 'cold': 'bg-blue-500' }
                return (<div key={type}><div className="flex items-center justify-between text-[10px] sm:text-xs mb-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-700 capitalize">{type}</span><span className="text-gray-400">({count})</span></div><span className="text-gray-600">{percentage}%</span></div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${colors[type as keyof typeof colors]}`} style={{ width: `${percentage}%` }}></div></div></div>)
              })}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3 sm:mb-4"><h3 className="text-xs sm:text-sm font-medium text-gray-900">Lead Trend (Last 7 Days)</h3></div>
            <div className="h-48 sm:h-56 md:h-64">
              {chartData ? (<Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#C41E3A', titleColor: '#fff', bodyColor: '#fff' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#6B7280' }, grid: { color: '#E5E7EB' } }, x: { ticks: { color: '#6B7280' }, grid: { display: false } } } }} />) : (<div className="h-full flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50/50"><div className="text-center"><div className="text-3xl sm:text-4xl mb-2">📊</div><p className="text-xs sm:text-sm text-gray-400">Loading chart...</p></div></div>)}
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 sm:mb-6">
          <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><h3 className="text-xs sm:text-sm font-medium text-gray-900">Recent Leads</h3><span className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-full">Live</span></div>
              <button onClick={() => router.push('/csr/leads')} className="text-[10px] sm:text-xs text-[#C41E3A] hover:underline flex items-center gap-1">View All <span>→</span></button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr><th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Lead</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Contact</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Type</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Created</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs font-medium text-gray-500">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((lead) => (<tr key={lead.id} className="hover:bg-gray-50/50"><td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4"><button onClick={() => router.push(`/csr/leads/${lead.id}`)} className="font-medium text-gray-900 hover:text-[#C41E3A]">{lead.name}</button></td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4"><div className="text-gray-600">{lead.email}</div><div className="text-gray-400 text-[10px] sm:text-xs">{lead.phone}</div></td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4"><select value={lead.type} onChange={(e) => handleUpdateType(lead.id, e.target.value as any)} className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-0 font-medium ${getTypeColor(lead.type)}`}><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option></select></td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4"><select value={lead.status} onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)} className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-0 font-medium ${getStatusColor(lead.status)}`}><option value="new">New</option><option value="contacted">Contacted</option><option value="followup">Follow Up</option><option value="interested">Interested</option><option value="converted">Converted</option><option value="not_interested">Not Interested</option></select></td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-gray-500 text-[10px] sm:text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 md:px-4"><div className="flex items-center gap-2"><button onClick={() => openEditModal(lead)} className="text-[10px] sm:text-xs text-blue-600 hover:underline">Edit</button><button onClick={() => handleDeleteLead(lead.id)} className="text-[10px] sm:text-xs text-red-600 hover:underline">Del</button></div></td></tr>))}
                {leads.length === 0 && (<tr><td colSpan={6} className="text-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">No leads found</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"><div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-5 md:p-6"><h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
      <div className="space-y-3 sm:space-y-4"><div><label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Name *</label><input type="text" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C41E3A]" placeholder="John Doe" required/></div>
      <div><label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Email *</label><input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C41E3A]" placeholder="john@example.com" required/></div>
      <div><label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Phone</label><input type="tel" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C41E3A]" placeholder="+92 300 1234567"/></div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3"><div><label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Type</label><select value={leadForm.type} onChange={(e) => setLeadForm({ ...leadForm, type: e.target.value as any })} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C41E3A]"><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option></select></div>
      <div><label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Status</label><select value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as any })} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C41E3A]"><option value="new">New</option><option value="contacted">Contacted</option><option value="followup">Follow Up</option><option value="interested">Interested</option><option value="converted">Converted</option><option value="not_interested">Not Interested</option></select></div></div></div>
      <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6"><button onClick={editingLead ? handleEditLead : handleAddLead} disabled={!leadForm.name || !leadForm.email} className="flex-1 px-3 sm:px-4 py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528] disabled:opacity-50">{editingLead ? 'Update' : 'Add'}</button>
      <button onClick={() => { setShowAddModal(false); setEditingLead(null); resetForm(); }} className="px-3 sm:px-4 py-2 border border-gray-200 text-xs sm:text-sm rounded-md hover:bg-gray-50">Cancel</button></div></div></div>)}
    </div>
  )
}