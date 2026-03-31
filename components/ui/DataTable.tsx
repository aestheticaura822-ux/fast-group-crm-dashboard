'use client'

import { useState } from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, row?: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  selectable?: boolean
  onSelect?: (selectedIds: string[]) => void
}

export default function DataTable({ data, columns, selectable, onSelect }: DataTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
      onSelect?.([])
    } else {
      const ids = data.map(item => item.id)
      setSelectedIds(ids)
      onSelect?.(ids)
    }
  }

  const handleSelectRow = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]
    setSelectedIds(newSelected)
    onSelect?.(newSelected)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {selectable && (
              <th className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#0A2472] focus:ring-[#0A2472]"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="py-3 text-left text-sm font-semibold text-gray-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
              {selectable && (
                <td className="py-3 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    className="rounded border-gray-300 text-[#0A2472] focus:ring-[#0A2472]"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  )
}