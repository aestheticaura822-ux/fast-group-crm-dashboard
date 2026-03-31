export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  FOLLOW_UP: 'followup',
  INTERESTED: 'interested',
  CONVERTED: 'converted',
  NOT_INTERESTED: 'not-interested'
} as const

export const STATUS_LABELS = {
  [LEAD_STATUS.NEW]: 'New',
  [LEAD_STATUS.CONTACTED]: 'Contacted',
  [LEAD_STATUS.FOLLOW_UP]: 'Follow-up',
  [LEAD_STATUS.INTERESTED]: 'Interested',
  [LEAD_STATUS.CONVERTED]: 'Converted',
  [LEAD_STATUS.NOT_INTERESTED]: 'Not Interested'
}

export const STATUS_COLORS = {
  [LEAD_STATUS.NEW]: 'bg-purple-100 text-purple-800',
  [LEAD_STATUS.CONTACTED]: 'bg-blue-100 text-blue-800',
  [LEAD_STATUS.FOLLOW_UP]: 'bg-yellow-100 text-yellow-800',
  [LEAD_STATUS.INTERESTED]: 'bg-green-100 text-green-800',
  [LEAD_STATUS.CONVERTED]: 'bg-emerald-100 text-emerald-800',
  [LEAD_STATUS.NOT_INTERESTED]: 'bg-gray-100 text-gray-800'
}