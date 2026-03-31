'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export interface Activity {
  id: string
  lead_id: string
  user_id: string
  activity_type: 'call' | 'email' | 'note' | 'status_change' | 'assignment'
  notes: string | null
  old_status: string | null
  new_status: string | null
  created_at: string
  lead?: {
    id: string
    name: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export function useActivities() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthToken = () => {
    return localStorage.getItem('token')
  }

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Request failed')
    }
    return response.json()
  }

  // Get all activities
  const getActivities = async (filters?: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(filters).toString()
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Get activities for a specific lead
  const getLeadActivities = async (leadId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/leads/${leadId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await handleResponse(response)
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Create activity
  const createActivity = async (leadId: string, data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      
      const result = await handleResponse(response)
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    getActivities,
    getLeadActivities,
    createActivity
  }
}