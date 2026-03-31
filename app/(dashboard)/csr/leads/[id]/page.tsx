'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'warm',
    status: 'new',
    source: '',
    notes: ''
  })

  useEffect(() => {
    setTimeout(() => {
      const leadData = {
        id: params.id,
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '+92 300 1234567',
        company: 'Tech Solutions',
        type: 'hot',
        status: 'new',
        source: 'Website',
        assignedTo: 'CSR User',
        createdAt: '2026-03-11T10:30:00',
        notes: 'Interested in printing services. Requested quote.',
        dealValue: null
      }
      setLead(leadData)
      setLeadForm({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        type: leadData.type,
        status: leadData.status,
        source: leadData.source,
        notes: leadData.notes
      })
      
      setActivities([
        {
          id: '1',
          type: 'call',
          description: 'Initial call - Customer interested',
          user: 'CSR User',
          createdAt: '2026-03-11T11:30:00'
        },
        {
          id: '2',
          type: 'email',
          description: 'Sent quote and brochure',
          user: 'CSR User',
          createdAt: '2026-03-11T12:15:00'
        }
      ])
      
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleUpdateLead = () => {
    setLead({ ...lead, ...leadForm })
    setShowEditModal(false)
  }

  const handleUpdateStatus = (status: string) => {
    setLead({ ...lead, status })
    const newActivity = {
      id: Date.now().toString(),
      type: 'status',
      description: `Status changed to ${status}`,
      user: 'CSR User',
      createdAt: new Date().toISOString()
    }
    setActivities([newActivity, ...activities])
  }

  const handleAddNote = () => {}
  const handleLogCall = () => {}

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-700',
      'contacted': 'bg-purple-100 text-purple-700',
      'follow_up': 'bg-yellow-100 text-yellow-700',
      'interested': 'bg-green-100 text-green-700',
      'converted': 'bg-emerald-100 text-emerald-700',
      'not_interested': 'bg-gray-100 text-gray-700'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'hot': 'bg-red-100 text-red-700',
      'warm': 'bg-yellow-100 text-yellow-700',
      'cold': 'bg-blue-100 text-blue-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{lead.name}</h1>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${getTypeColor(lead.type)}`}>
              {lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}
            </span>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
              {lead.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500">
            Lead from {lead.source} • Created {new Date(lead.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 text-xs sm:text-sm rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
          >
            Edit Lead
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Email</p>
                <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">{lead.email}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Phone</p>
                <p className="text-xs sm:text-sm font-medium text-gray-900">{lead.phone}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Company</p>
                <p className="text-xs sm:text-sm font-medium text-gray-900">{lead.company}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Assigned To</p>
                <p className="text-xs sm:text-sm font-medium text-gray-900">{lead.assignedTo}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium text-gray-900">Notes</h2>
              <button
                onClick={handleAddNote}
                className="text-[10px] sm:text-xs text-[#C41E3A] hover:underline"
              >
                + Add Note
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 break-words">{lead.notes}</p>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Activity Timeline</h2>
            <div className="space-y-3 sm:space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                    {activity.type === 'call' ? '📞' : activity.type === 'email' ? '✉️' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 break-words">{activity.description}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      {activity.user} • {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleLogCall}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#C41E3A] text-white rounded-md hover:bg-[#8B1528]"
              >
                Log Call
              </button>
              <button className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                Send Email
              </button>
              <button className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                Schedule Follow-up
              </button>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Update Status</h2>
            <div className="space-y-2">
              {['new', 'contacted', 'follow_up', 'interested', 'converted', 'not_interested'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-md transition-colors ${
                    lead.status === status
                      ? getStatusColor(status)
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Score */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Lead Score</h2>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#C41E3A] mb-0.5 sm:mb-1">
                {lead.type === 'hot' ? '85' : lead.type === 'warm' ? '60' : '30'}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {lead.type === 'hot' ? 'High Intent' : lead.type === 'warm' ? 'Medium Intent' : 'Low Intent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Responsive */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Edit Lead</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Company</label>
                    <input
                      type="text"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select
                      value={leadForm.type}
                      onChange={(e) => setLeadForm({ ...leadForm, type: e.target.value })}
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
                      onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleUpdateLead}
                  className="flex-1 px-3 sm:px-4 py-2 bg-[#C41E3A] text-white text-xs sm:text-sm rounded-md hover:bg-[#8B1528]"
                >
                  Update Lead
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
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