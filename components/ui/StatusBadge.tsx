interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'status-new',
      'contacted': 'status-contacted',
      'followup': 'status-followup',
      'interested': 'status-interested',
      'converted': 'status-converted',
      'not-interested': 'status-not-interested'
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}