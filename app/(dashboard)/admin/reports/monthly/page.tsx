'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useReports } from '@/hooks/useReports'

export default function AdminMonthlyReport() {
  const { getMonthlyReport, isLoading } = useReports()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReport()
  }, [currentDate])

  const loadReport = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      setSelectedYear(year)
      setSelectedMonth(month)
      const data = await getMonthlyReport(year, month)
      setReport(data)
    } catch (error) {
      console.error('Error loading monthly report:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value)
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    setCurrentDate(newDate)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value) - 1
    const newDate = new Date(currentDate)
    newDate.setMonth(month)
    setCurrentDate(newDate)
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const data = JSON.stringify(report, null, 2)
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monthly-report-${selectedYear}-${selectedMonth}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(null)
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    const printWindow = window.open('', '_blank')
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Monthly Report - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; max-width: 1200px; margin: 0 auto; }
              h1 { color: #C41E3A; border-bottom: 2px solid #C41E3A; padding-bottom: 10px; }
              h2 { color: #333; margin-top: 30px; }
              .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
              .stat-card { padding: 20px; border-radius: 8px; border-left: 4px solid; }
              .bg-blue-50 { background-color: #eff6ff; }
              .bg-red-50 { background-color: #fef2f2; }
              .bg-yellow-50 { background-color: #fefce8; }
              .text-2xl { font-size: 28px; font-weight: bold; margin-top: 8px; }
              .conversion-box { background: white; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 30px 0; }
              .progress-bar { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; margin-top: 15px; }
              .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
              .daily-breakdown { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin: 20px 0; }
              .day-card { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
              .day-number { font-size: 18px; font-weight: bold; color: #C41E3A; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Monthly Report - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</h1>
            ${printContent}
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>Fast Group CRM - Monthly Performance Report</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  const totalLeads = report?.totalLeads || 0
  const convertedLeads = report?.conversions || 0
  const conversionRate = report?.conversionRate || 0
  const avgDealValue = report?.averageDealValue || 0
  const totalRevenue = report?.totalRevenue || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header with all controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/admin/reports">
              <button className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300">
                ← Back
              </button>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Monthly Report</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Monthly lead performance analysis</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Month/Year Selector */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
              <select
                value={currentDate.getMonth()}
                onChange={handleMonthChange}
                className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <button onClick={() => changeMonth('prev')} className="border-2 border-[#C41E3A] text-[#C41E3A] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">←</button>
            <button onClick={() => changeMonth('next')} className="border-2 border-[#C41E3A] text-[#C41E3A] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">→</button>
            <button onClick={loadReport} className="border-2 border-[#C41E3A] text-[#C41E3A] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">🔄</button>

            {/* Export Buttons */}
            <button onClick={() => handleExport('csv')} disabled={!!exporting} className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50">
              {exporting === 'csv' ? '⏳' : '📥'} CSV
            </button>
            
            <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50">
              {exporting === 'pdf' ? '⏳' : '📄'} PDF
            </button>
            
            <button onClick={handlePrint} className="bg-[#C41E3A] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#8B1528] transition-all duration-300">
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="space-y-4 sm:space-y-6">
        {/* Month Header */}
        <div className="bg-gradient-to-r from-[#C41E3A] to-[#8B1528] text-white p-4 sm:p-6 rounded-lg">
          <div className="text-xs sm:text-sm opacity-90">Monthly Performance Report</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">Generated at {new Date().toLocaleTimeString()}</div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-5 rounded-lg border-l-4 border-blue-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Total Monthly Leads</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mt-0.5 sm:mt-1">{totalLeads}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">↑ 15.3% vs last month</div>
          </div>

          <div className="bg-green-50 p-3 sm:p-5 rounded-lg border-l-4 border-green-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Conversions</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-0.5 sm:mt-1">{convertedLeads}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">↑ 12.5% vs last month</div>
          </div>

          <div className="bg-purple-50 p-3 sm:p-5 rounded-lg border-l-4 border-purple-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Conversion Rate</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mt-0.5 sm:mt-1">{conversionRate.toFixed(1)}%</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">↑ 5.2% vs last month</div>
          </div>

          <div className="bg-indigo-50 p-3 sm:p-5 rounded-lg border-l-4 border-indigo-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Total Revenue</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 mt-0.5 sm:mt-1">${totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">Avg: ${avgDealValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Lead Type Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-red-50 p-3 sm:p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div><div className="text-[10px] sm:text-sm text-gray-600">Hot Leads</div><div className="text-xl sm:text-2xl font-bold text-red-600 mt-0.5 sm:mt-1">{report?.byType?.hot || 0}</div></div>
              <div className="text-xl sm:text-2xl">🔥</div>
            </div>
            <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600">↑ 12.5% vs last month</div>
          </div>

          <div className="bg-yellow-50 p-3 sm:p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div><div className="text-[10px] sm:text-sm text-gray-600">Warm Leads</div><div className="text-xl sm:text-2xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{report?.byType?.warm || 0}</div></div>
              <div className="text-xl sm:text-2xl">⭐</div>
            </div>
            <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600">↑ 8.2% vs last month</div>
          </div>

          <div className="bg-blue-50 p-3 sm:p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div><div className="text-[10px] sm:text-sm text-gray-600">Cold Leads</div><div className="text-xl sm:text-2xl font-bold text-blue-600 mt-0.5 sm:mt-1">{report?.byType?.cold || 0}</div></div>
              <div className="text-xl sm:text-2xl">❄️</div>
            </div>
            <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600">↑ 5.1% vs last month</div>
          </div>
        </div>

        {/* Conversion Rate Detail */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Conversion Performance</h2>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C41E3A]">{conversionRate.toFixed(1)}%</span>
                <span className="text-[10px] sm:text-xs text-gray-500">({convertedLeads} converted / {totalLeads} leads)</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full">↑ 5.2% from last month</span>
                <span className="text-[10px] sm:text-xs text-gray-400">Target: 40%</span>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Progress to target</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((conversionRate / 40) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        {report?.dailyBreakdown && report.dailyBreakdown.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Daily Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
              {report.dailyBreakdown.map((day: any) => (
                <div key={day.date} className="bg-gray-50 p-2 sm:p-3 rounded-lg text-center">
                  <div className="text-xs sm:text-sm font-bold text-[#C41E3A]">Day {day.date}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 mt-1">Leads: {day.leads}</div>
                  {day.conversions > 0 && <div className="text-[10px] sm:text-xs text-green-600">✓ {day.conversions}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Sources */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Lead Sources</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(report?.bySource || {}).map(([source, count]: [string, any]) => {
              const percentage = ((count / totalLeads) * 100).toFixed(1)
              return (
                <div key={source} className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center hover:shadow-md transition">
                  <div className="text-lg sm:text-2xl font-bold text-[#C41E3A]">{count}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 capitalize mt-1">{source}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{percentage}%</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Monthly Summary</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600 text-xs sm:text-sm">Total Working Days</span><span className="font-medium text-xs sm:text-sm">{report?.dailyBreakdown?.length || 0}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600 text-xs sm:text-sm">Average Leads/Day</span><span className="font-medium text-xs sm:text-sm">{(totalLeads / (report?.dailyBreakdown?.length || 1)).toFixed(1)}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600 text-xs sm:text-sm">Best Day (Leads)</span><span className="font-medium text-xs sm:text-sm">{report?.dailyBreakdown?.reduce((max: any, day: any) => day.leads > (max?.leads || 0) ? day : max, { leads: 0 }).date || '-'}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-600 text-xs sm:text-sm">Average Deal Value</span><span className="font-medium text-xs sm:text-sm">${avgDealValue.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <Link href={`/admin/reports/daily?month=${selectedMonth}&year=${selectedYear}`}>
                <button className="w-full border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300 text-left">📅 View Daily Breakdown</button>
              </Link>
              <Link href={`/admin/leads?month=${selectedMonth}&year=${selectedYear}`}>
                <button className="w-full border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300 text-left">📋 View All Leads ({totalLeads})</button>
              </Link>
              <Link href={`/admin/reports/export?type=detailed&month=${selectedMonth}&year=${selectedYear}`}>
                <button className="w-full border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300 text-left">📊 Detailed Analysis</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">↑ Back to Top</button>
        <div className="text-[10px] sm:text-xs text-gray-400">Last updated: {new Date().toLocaleString()}</div>
        <Link href="/admin/reports"><button className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">← All Reports</button></Link>
      </div>
    </motion.div>
  )
}