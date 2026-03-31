'use client'

import { useState } from 'react'

export interface ScraperJob {
  id: string
  platform: string
  keywords: string[]
  location: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  results_count: number
  created_at: string
  completed_at: string | null
  error_message: string | null
}

export const useScraper = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getJobs = async (): Promise<ScraperJob[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/scraper/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch jobs')
      return await response.json()
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getJobStatus = async (jobId: string): Promise<ScraperJob | null> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/scraper/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch job status')
      return await response.json()
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const startScraping = async (platform: string, keywords: string[], location?: string): Promise<{ jobId: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/scraper/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform, keywords, location })
      })
      
      if (!response.ok) throw new Error('Failed to start scraping')
      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const stopJob = async (jobId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://fast-group-crm-backend.vercel.app/api/scraper/jobs/${jobId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to stop job')
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = async (): Promise<Blob> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://fast-group-crm-backend.vercel.app/api/scraper/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to export')
      return await response.blob()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return {
    getJobs,
    getJobStatus,
    startScraping,
    stopJob,
    exportToCSV,
    downloadCSV,
    isLoading,
    error
  }
}