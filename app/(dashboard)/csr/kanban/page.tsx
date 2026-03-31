'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface KanbanCardProps {
  lead: any
  getTypeColor: (type: string) => string
}

function KanbanCard({ lead, getTypeColor }: KanbanCardProps) {
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

  // Safely format date
  const formattedDate = lead.lastContact 
    ? new Date(lead.lastContact).toLocaleDateString() 
    : new Date(lead.created_at || Date.now()).toLocaleDateString()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 cursor-move border-l-4"
      style={{
        borderLeftColor: lead.type === 'hot' ? '#DC2626' : 
                         lead.type === 'warm' ? '#F59E0B' : '#3B82F6'
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{lead.name || 'Unnamed Lead'}</h4>
        <span className="text-xs text-gray-500">
          {formattedDate}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(lead.type || 'warm')}`}>
          {lead.type || 'warm'}
        </span>
        {lead.deal_value && (
          <span className="text-xs text-green-600 font-medium">
            PKR {Number(lead.deal_value).toLocaleString()}
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
  getTypeColor: (type: string) => string
}

export default function KanbanBoard({ id, leads = [], color, getTypeColor }: KanbanBoardProps) {
  // Default empty array if leads is undefined
  const safeLeads = leads || []
  
  return (
    <div className="bg-gray-50 rounded-b-lg p-4 min-h-[500px]">
      <div className="space-y-3">
        {safeLeads.length > 0 ? (
          safeLeads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} getTypeColor={getTypeColor} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  )
}