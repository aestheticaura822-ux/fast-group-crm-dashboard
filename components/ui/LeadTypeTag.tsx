interface LeadTypeTagProps {
  type: 'hot' | 'warm' | 'cold'
}

export default function LeadTypeTag({ type }: LeadTypeTagProps) {
  const getTypeClass = (type: string) => {
    const typeMap: Record<string, string> = {
      'hot': 'lead-hot',
      'warm': 'lead-warm',
      'cold': 'lead-cold'
    }
    return typeMap[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'hot': '🔥',
      'warm': '🌡️',
      'cold': '❄️'
    }
    return iconMap[type] || '📌'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeClass(type)}`}>
      <span>{getTypeIcon(type)}</span>
      <span className="capitalize">{type}</span>
    </span>
  )
}