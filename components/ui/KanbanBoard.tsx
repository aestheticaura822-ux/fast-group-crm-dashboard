'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface KanbanCardProps {
  lead: any
}

function KanbanCard({ lead }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const getTypeColor = (type: string) => {
    const colors = {
      hot: 'bg-red-100 border-red-300',
      warm: 'bg-orange-100 border-orange-300',
      cold: 'bg-blue-100 border-blue-300'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${getTypeColor(lead.type)} border-l-4`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{lead.name}</h4>
        <span className="text-xs text-gray-500">
          {new Date(lead.lastContact).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-white rounded-full">
          {lead.type}
        </span>
        {lead.value && (
          <span className="text-xs text-green-600">
            PKR {lead.value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  id: string
  leads: any[]
  color: string
}

export default function KanbanBoard({ id, leads, color }: KanbanBoardProps) {
  return (
    <div className="kanban-column">
      <div className="space-y-3">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No leads
          </div>
        )}
      </div>
    </div>
  )
}