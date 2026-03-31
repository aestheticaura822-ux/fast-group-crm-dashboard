'use client'

import { useState } from 'react'

interface FilterFormProps {
  filters: any
  onChange: (filters: any) => void
  onApply: () => void
}

export default function FilterForm({ filters, onChange, onApply }: FilterFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const resetFilters = () => {
    onChange({
      search: '',
      type: '',
      status: '',
      source: '',
      dateRange: ''
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs sm:text-sm text-[#C41E3A] hover:underline text-left sm:text-right"
        >
          {isOpen ? 'Hide Filters ↑' : 'Show Filters ↓'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
            />

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => onChange({ ...filters, type: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="followup">Follow-up</option>
              <option value="interested">Interested</option>
              <option value="converted">Converted</option>
              <option value="not-interested">Not Interested</option>
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
              onChange={(e) => onChange({ ...filters, source: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="maps">Google Maps</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto border-2 border-[#C41E3A] text-[#C41E3A] px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#C41E3A] hover:text-white transition-all duration-300"
            >
              Reset
            </button>
            <button
              onClick={onApply}
              className="w-full sm:w-auto bg-[#C41E3A] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm
                       hover:bg-[#8B1528] transition-all duration-300 shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}