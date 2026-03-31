'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useActivities, Activity } from '@/hooks/useActivities'
import { createClient } from '@/lib/supabase/client'

export default function ActivitiesPage() {
  const { getActivities } = useActivities()
  const supabase = createClient()
  
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Use ref to prevent multiple calls
  const initialLoadDone = useRef(false)

  // Load activities - stable function
  const loadActivities = useCallback(async () => {
    setError(null)
    try {
      const data = await getActivities()
      setActivities(data || [])
      console.log('✅ Loaded activities:', data?.length)
    } catch (error: any) {
      console.error('Error loading activities:', error)
      setError(error.message || 'Failed to load activities')
    }
  }, [getActivities])

  // Load activities only once on mount
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true
      loadActivities()
    }
  }, [loadActivities])

  // REAL-TIME SUBSCRIPTION
  useEffect(() => {
    console.log('Setting up real-time subscription for activities...')
    
    const channel = supabase
      .channel('activities-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_activities'
        },
        async (payload) => {
          console.log('🆕 New activity inserted:', payload.new)
          
          // Fetch the complete activity with lead and user details
          const { data: newActivity, error } = await supabase
            .from('lead_activities')
            .select(`
              *,
              lead:lead_id(name, email, phone),
              user:user_id(name, email)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (error) {
            console.error('Error fetching new activity details:', error)
            return
          }
          
          if (newActivity) {
            console.log('📝 Adding new activity to UI:', newActivity)
            setActivities(prev => {
              // Check if activity already exists (avoid duplicates)
              if (prev.some(act => act.id === newActivity.id)) {
                return prev
              }
              return [newActivity as Activity, ...prev]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lead_activities'
        },
        async (payload) => {
          console.log('🔄 Activity updated:', payload.old, '->', payload.new)
          
          // Fetch the updated complete activity
          const { data: updatedActivity, error } = await supabase
            .from('lead_activities')
            .select(`
              *,
              lead:lead_id(name, email, phone),
              user:user_id(name, email)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (error) {
            console.error('Error fetching updated activity details:', error)
            return
          }
          
          if (updatedActivity) {
            console.log('📝 Updating activity in UI:', updatedActivity.id)
            setActivities(prev => 
              prev.map(activity => 
                activity.id === updatedActivity.id 
                  ? { ...activity, ...updatedActivity } as Activity
                  : activity
              )
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lead_activities'
        },
        (payload) => {
          console.log('❌ Activity deleted:', payload.old)
          setActivities(prev => 
            prev.filter(activity => activity.id !== payload.old.id)
          )
        }
      )
      .subscribe((status) => {
        console.log('Activities subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for activities')
        }
      })

    return () => {
      console.log('Cleaning up activities subscription...')
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞'
      case 'email': return '✉️'
      case 'note': return '📝'
      case 'status_change': return '🔄'
      case 'assignment': return '👤'
      default: return '📌'
    }
  }

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'call': 'bg-blue-100 text-blue-700',
      'email': 'bg-green-100 text-green-700',
      'note': 'bg-yellow-100 text-yellow-700',
      'status_change': 'bg-purple-100 text-purple-700',
      'assignment': 'bg-orange-100 text-orange-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const filteredActivities = activities.filter(activity => {
    const matchesType = filter === 'all' || activity.activity_type === filter
    const matchesSearch = searchTerm === '' || 
      activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesSearch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 md:space-y-8"
    >
      {/* Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {filteredActivities.length} activities • Live updates
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-[10px] sm:text-sm mx-4 sm:mx-0">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mx-4 sm:mx-0">
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Activity Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            >
              <option value="all">All Activities</option>
              <option value="call">📞 Calls</option>
              <option value="email">✉️ Emails</option>
              <option value="note">📝 Notes</option>
              <option value="status_change">🔄 Status Changes</option>
              <option value="assignment">👤 Assignments</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by note, lead, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={loadActivities}
              className="bg-[#C41E3A] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#8B1528] transition-all duration-300 shadow-md"
            >
              Refresh
            </button>
            <span className="ml-2 sm:ml-3 flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mx-4 sm:mx-0">
        <div className="divide-y divide-gray-100">
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-xl flex-shrink-0 ${getActivityTypeColor(activity.activity_type)}`}>
                {getActivityIcon(activity.activity_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">{activity.notes}</p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        Lead: <span className="font-medium">{activity.lead?.name || 'Unknown'}</span>
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        By: <span className="font-medium">{activity.user?.name || 'System'}</span>
                      </span>
                      {activity.old_status && activity.new_status && (
                        <>
                          <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            Status: <span className="font-medium">{activity.old_status}</span> → 
                            <span className="font-medium text-[#C41E3A]"> {activity.new_status}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📭</div>
            <p className="text-xs sm:text-sm text-gray-400">No activities found</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
              Activities will appear here when you interact with leads
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}