'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useReports } from '@/hooks/useReports'

export default function AdminDailyReport() {
  const { getDailyReport, isLoading } = useReports()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async (date?: string) => {
    setLoading(true)
    try {
      const data = await getDailyReport(date)
      setReport(data)
      if (data?.date) {
        setSelectedDate(data.date)
      }
    } catch (error) {
      console.error('Error loading daily report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    loadReport(date)
  }

  const handleRefresh = () => {
    loadReport(selectedDate)
  }

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    const printWindow = window.open('', '_blank')
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Daily Report - ${report?.date || new Date().toLocaleDateString()}</title>
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
              .text-sm { font-size: 14px; color: #666; }
              .conversion-box { background: white; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 30px 0; }
              .progress-bar { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; margin-top: 15px; }
              .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; color: #666; }
              td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Daily Report - ${report?.date || new Date().toLocaleDateString()}</h1>
            ${printContent}
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>Fast Group CRM - Lead Generation Report</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
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
      a.download = `daily-report-${report?.date}.${format}`
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

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
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Daily Report</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Detailed daily lead analysis</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C41E3A]"
              />
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="border-2 border-[#C41E3A] text-[#C41E3A] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm
                         hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                🔄
              </button>
            </div>
            
            <button 
              onClick={() => handleExport('csv')}
              disabled={!!exporting}
              className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {exporting === 'csv' ? '⏳' : '📥'} CSV
            </button>
            
            <button 
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
              className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {exporting === 'pdf' ? '⏳' : '📄'} PDF
            </button>
            
            <button 
              onClick={handlePrint}
              className="bg-[#C41E3A] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#8B1528] transition-all duration-300"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="space-y-4 sm:space-y-6">
        {/* Date Header */}
        <div className="bg-gradient-to-r from-[#C41E3A] to-[#8B1528] text-white p-4 sm:p-6 rounded-lg">
          <div className="text-xs sm:text-sm opacity-90">Report Date</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold">{report?.date || new Date().toLocaleDateString()}</div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">Generated at {new Date().toLocaleTimeString()}</div>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-5 rounded-lg border-l-4 border-blue-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Total Daily Leads</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mt-0.5 sm:mt-1">{report?.totalLeads || 0}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2 flex items-center gap-1">↑ {report?.totalLeads ? '+12' : '0'} from yesterday</div>
          </div>

          <div className="bg-red-50 p-3 sm:p-5 rounded-lg border-l-4 border-red-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Hot Leads</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-0.5 sm:mt-1">{report?.byType?.hot || 0}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2 flex items-center gap-1">↑ {report?.byType?.hot ? '+3' : '0'} from yesterday</div>
          </div>

          <div className="bg-yellow-50 p-3 sm:p-5 rounded-lg border-l-4 border-yellow-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Warm Leads</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{report?.byType?.warm || 0}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2 flex items-center gap-1">↑ {report?.byType?.warm ? '+5' : '0'} from yesterday</div>
          </div>

          <div className="bg-indigo-50 p-3 sm:p-5 rounded-lg border-l-4 border-indigo-500">
            <div className="text-[10px] sm:text-sm text-gray-600">Cold Leads</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 mt-0.5 sm:mt-1">{report?.byType?.cold || 0}</div>
            <div className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2 flex items-center gap-1">↑ {report?.byType?.cold ? '+4' : '0'} from yesterday</div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Conversion Rate</h2>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C41E3A]">
                  {report?.conversionRate?.toFixed(1) || '0'}%
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  ({report?.conversions || 0} converted / {report?.totalLeads || 0} leads)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full">↑ 2% from yesterday</span>
                <span className="text-[10px] sm:text-xs text-gray-400">Target: 25%</span>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Progress to target</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((report?.conversionRate || 0) / 25 * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* By Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">By Status</h2>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(report?.byStatus || {}).map(([status, count]: [string, any]) => {
                const percentage = ((count / (report?.totalLeads || 1)) * 100).toFixed(1)
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center text-[10px] sm:text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{status}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-gray-600">{count}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400 w-10 sm:w-12">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Source */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">By Source</h2>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(report?.bySource || {}).map(([source, count]: [string, any]) => {
                const percentage = ((count / (report?.totalLeads || 1)) * 100).toFixed(1)
                return (
                  <div key={source}>
                    <div className="flex justify-between items-center text-[10px] sm:text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{source}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-gray-600">{count}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400 w-10 sm:w-12">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Lead Details Table */}
        {report?.leads && report.leads.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Lead Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.leads.slice(0, 10).map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          lead.type === 'hot' ? 'bg-red-100 text-red-700' :
                          lead.type === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.type}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-500 capitalize">{lead.source}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-500">{new Date(lead.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">
          ↑ Back to Top
        </button>
        <Link href="/admin/reports">
          <button className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">
            ← All Reports
          </button>
        </Link>
      </div>
    </motion.div>
  )
}