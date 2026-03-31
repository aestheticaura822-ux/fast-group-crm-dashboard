'use client'

import { useState } from 'react'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  message: string | null
  type: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not_interested'
  source: string
  deal_value: number | null
  assigned_to: string | null
  created_by: string | null
  converted_by: string | null
  converted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  user_id: string
  activity_type: 'call' | 'email' | 'note' | 'status_change' | 'assignment'
  notes: string | null
  old_status: string | null
  new_status: string | null
  created_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export function useLeads() {
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

  // Get all leads with filters
  const getLeads = async (filters?: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams(filters).toString()
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads?${params}`, {
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

  // Get single lead
  const getLead = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}`, {
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

  // Create lead
  const createLead = async (data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/leads', {
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

  // Update lead
  const updateLead = async (id: string, data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}`, {
        method: 'PUT',
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

  // Delete lead
  const deleteLead = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  // Assign lead
  const assignLead = async (id: string, userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
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

  // Convert lead
  const convertLead = async (id: string, dealValue: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/leads/${id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dealValue })
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

  // Get lead activities
  const getLeadActivities = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}/activities`, {
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

  // Add activity
  const addActivity = async (id: string, activity: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/leads/${id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activity)
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

  // Update lead status (specific function)
  const updateLeadStatus = async (id: string, status: string) => {
    return updateLead(id, { status })
  }

  // Update lead type (specific function)
  const updateLeadType = async (id: string, type: 'hot' | 'warm' | 'cold') => {
    return updateLead(id, { type })
  }

  return {
    isLoading,
    error,
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    convertLead,
    getLeadActivities,
    addActivity,
    updateLeadStatus,
    updateLeadType
  }
}