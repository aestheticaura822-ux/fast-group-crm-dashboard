'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export interface DashboardStats {
  totalLeads: number
  todayLeads: number
  hotLeads: number
  conversions: number
  conversionRate: number
  teamPerformance?: Array<{
    userId: string
    userName: string
    leadsHandled: number
  }>
  recentActivities?: Array<{
    id: string
    lead_id: string
    lead?: { name: string }
    user?: { name: string }
    activity_type: string
    notes: string
    created_at: string
  }>
}

export interface DailyReport {
  date: string
  totalLeads: number
  byType: {
    hot: number
    warm: number
    cold: number
  }
  byStatus: {
    new: number
    contacted: number
    followup: number
    interested: number
    converted: number
    not_interested: number
  }
  bySource: Record<string, number>
  leads: any[]
  conversions: number
  conversionRate: number
}

export interface MonthlyReport {
  year: number
  month: number
  totalLeads: number
  conversions: number
  conversionRate: number
  totalRevenue: number
  averageDealValue: number
  byType: {
    hot: number
    warm: number
    cold: number
  }
  bySource: Record<string, number>
  dailyBreakdown: Array<{
    date: number
    leads: number
    conversions: number
  }>
}

export interface CSRPerformance {
  userId: string
  totalLeads: number
  conversions: number
  conversionRate: number
  totalActivities: number
  byType: {
    hot: number
    warm: number
    cold: number
  }
  leads: Array<{
    id: string
    name: string
    status: string
    type: string
    created_at: string
  }>
}

export interface SalesPerformance {
  userId: string
  totalConversions: number
  totalRevenue: number
  averageDealValue: number
  conversions: Array<{
    id: string
    name: string
    deal_value: number
    converted_at: string
  }>
}

export interface LeadSourceReport {
  source: string
  count: number
  percentage: number
}

export interface ConversionFunnel {
  stage: string
  count: number
}

export function useReports() {
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

  // Get dashboard stats
  const getDashboardStats = async (): Promise<DashboardStats> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/reports/dashboard`, {
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

  // Get daily report
  const getDailyReport = async (date?: string): Promise<DailyReport> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      const url = date 
        ? `${API_URL}/api/reports/daily?date=${date}` 
        : `${API_URL}/api/reports/daily`
      
      const response = await fetch(url, {
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

  // Get monthly report
  const getMonthlyReport = async (year?: number, month?: number): Promise<MonthlyReport> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())
      
      const response = await fetch(`${API_URL}/api/reports/monthly?${params}`, {
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

  // Get CSR performance
  const getCSRPerformance = async (userId: string, startDate?: string, endDate?: string): Promise<CSRPerformance> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`${API_URL}/api/reports/csr/${userId}?${params}`, {
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

  // Get sales performance
  const getSalesPerformance = async (userId: string, startDate?: string, endDate?: string): Promise<SalesPerformance> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`${API_URL}/api/reports/sales/${userId}?${params}`, {
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

  // Get lead sources report
  const getLeadSourcesReport = async (): Promise<LeadSourceReport[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/reports/sources`, {
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

  // Get conversion funnel
  const getConversionFunnel = async (): Promise<ConversionFunnel[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/reports/funnel`, {
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

  // ✅ SINGLE EXPORT FUNCTION - FIXED
  const exportReport = async (type: string, startDate: string, endDate: string): Promise<Blob> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(
        `${API_URL}/api/reports/export?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Export failed')
      }
      
      return response.blob()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Get recent leads (helper function)
  const getRecentLeads = async (limit: number = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/api/leads?limit=${limit}&sort=created_at:desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await handleResponse(response)
      return data.data || []
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Get performance data for charts
  const getPerformanceData = async (period: 'week' | 'month' | 'quarter' = 'month') => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      
      const today = new Date()
      let startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(today.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(today.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(today.getMonth() - 3)
          break
      }
      
      const response = await fetch(
        `${API_URL}/api/reports/daily?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      const data = await handleResponse(response)
      return data
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
    getDashboardStats,
    getDailyReport,
    getMonthlyReport,
    getCSRPerformance,
    getSalesPerformance,
    getLeadSourcesReport,
    getConversionFunnel,
    exportReport,        // ✅ Single export function
    getRecentLeads,
    getPerformanceData
  }
}