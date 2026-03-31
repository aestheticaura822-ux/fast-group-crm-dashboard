'use client'

import { useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'csr' | 'sales'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface UserStats {
  totalLeads: number
  conversions: number
  conversionRate: number
  activities: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
}

export function useUsers() {
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

  // Get all users
  const getUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/users', {
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

  // Get user by ID
  const getUser = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/users/${id}`, {
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

  // Create user
  const createUser = async (data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/users', {
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

  // Update user
  const updateUser = async (id: string, data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/users/${id}`, {
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

  // Delete user
  const deleteUser = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/users/${id}`, {
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

  // Get user stats
  const getUserStats = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/users/${id}/stats`, {
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

  // Update user status (activate/deactivate)
  const updateUserStatus = async (id: string, isActive: boolean) => {
    return updateUser(id, { is_active: isActive })
  }

  // Update user role
  const updateUserRole = async (id: string, role: 'admin' | 'csr' | 'sales') => {
    return updateUser(id, { role })
  }

  return {
    isLoading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats,
    updateUserStatus,
    updateUserRole
  }
}