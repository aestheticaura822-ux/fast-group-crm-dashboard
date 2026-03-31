'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Link from 'next/link'
import { useReports } from '@/hooks/useReports'

export default function ReportsPage() {
  const { getDailyReport, getMonthlyReport, exportReport, isLoading } = useReports()
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange
  const [reportType, setReportType] = useState('daily')
  const [isExporting, setIsExporting] = useState(false)
  const [dailyData, setDailyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generateSuccess, setGenerateSuccess] = useState('')
  const [generateError, setGenerateError] = useState('')

  // Load initial data
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const daily = await getDailyReport()
      setDailyData(daily)
      const monthly = await getMonthlyReport()
      setMonthlyData(monthly)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setGenerateSuccess('')
    setGenerateError('')
    
    try {
      if (reportType === 'daily') {
        const date = startDate ? startDate.toISOString().split('T')[0] : undefined
        const data = await getDailyReport(date)
        setDailyData(data)
        setGenerateSuccess(`Daily report generated successfully for ${data.date}`)
      } else if (reportType === 'monthly') {
        const year = startDate?.getFullYear()
        const month = startDate ? startDate.getMonth() + 1 : undefined
        const data = await getMonthlyReport(year, month)
        setMonthlyData(data)
        const monthName = startDate?.toLocaleString('default', { month: 'long' })
        setGenerateSuccess(`Monthly report generated successfully for ${monthName} ${year || new Date().getFullYear()}`)
      }
    } catch (error: any) {
      setGenerateError(error.message || 'Failed to generate report')
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setDateRange([null, null])
    setReportType('daily')
    setGenerateSuccess('')
    setGenerateError('')
    loadReports()
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    setGenerateSuccess('')
    setGenerateError('')
    
    try {
      if (!startDate || !endDate) {
        throw new Error('Please select date range first')
      }

      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]
      
      const blob = await exportReport(format, start, end)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${start}-to-${end}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      setGenerateSuccess(`Report exported successfully as ${format.toUpperCase()}`)
    } catch (error: any) {
      setGenerateError(error.message || 'Failed to export report')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading && !dailyData && !monthlyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Reports & Analytics</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                {dailyData?.date || new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting || !startDate || !endDate}
                  className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-[10px] sm:text-xs
                           hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                  {isExporting ? '⏳' : 'CSV'}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting || !startDate || !endDate}
                  className="bg-[#C41E3A] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-[10px] sm:text-xs
                           hover:bg-[#8B1528] transition-all duration-300 disabled:opacity-50"
                >
                  {isExporting ? '⏳' : 'PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Success/Error Messages */}
        {generateSuccess && (
          <div className="mb-3 sm:mb-4 bg-green-50 text-green-700 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm border-l-4 border-green-500">
            {generateSuccess}
          </div>
        )}
        
        {generateError && (
          <div className="mb-3 sm:mb-4 bg-red-50 text-red-700 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm border-l-4 border-red-500">
            {generateError}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Date Range
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
                placeholderText="Select date range"
                isClearable={true}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
              >
                <option value="daily">Daily Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>

            <div className="flex gap-2 lg:self-end">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-[#C41E3A] text-white px-4 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm
                         hover:bg-[#8B1528] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '⏳' : 'Generate'}
              </button>
              <button 
                onClick={handleReset}
                className="border-2 border-[#C41E3A] text-[#C41E3A] px-4 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm
                         hover:bg-[#C41E3A] hover:text-white transition-all duration-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Report Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link href="/admin/reports/daily">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Daily Report</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Today: {dailyData?.totalLeads || 0} leads, {dailyData?.conversions || 0} conversions
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/reports/monthly">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Monthly Report</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    This month: {monthlyData?.totalLeads || 0} leads, {monthlyData?.conversionRate?.toFixed(1) || 0}% conversion
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Real-time Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs text-gray-500">Total Leads Today</div>
            <div className="text-xl sm:text-2xl font-bold text-[#C41E3A] mt-1">
              {dailyData?.totalLeads || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-2">Updated real-time</div>
            <button 
              onClick={() => window.location.href = '/admin/reports/daily'}
              className="mt-3 w-full border-2 border-[#C41E3A] text-[#C41E3A] py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300"
            >
              View Details
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs text-gray-500">Conversions Today</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
              {dailyData?.byStatus?.converted || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-2">Updated real-time</div>
            <button 
              onClick={() => window.location.href = '/admin/reports/daily'}
              className="mt-3 w-full border-2 border-[#C41E3A] text-[#C41E3A] py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300"
            >
              View Details
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs text-gray-500">Monthly Total</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
              {monthlyData?.totalLeads || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-2">Updated real-time</div>
            <button 
              onClick={() => window.location.href = '/admin/reports/monthly'}
              className="mt-3 w-full border-2 border-[#C41E3A] text-[#C41E3A] py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}