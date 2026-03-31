export type LeadType = 'hot' | 'warm' | 'cold'
export type LeadStatus = 'new' | 'contacted' | 'followup' | 'interested' | 'converted' | 'not-interested'
export type LeadSource = 'website' | 'facebook' | 'instagram' | 'linkedin' | 'maps' | 'manual' | 'import'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  type: LeadType
  status: LeadStatus
  source: LeadSource
  assignedTo?: string
  createdBy?: string
  convertedBy?: string
  convertedAt?: string
  dealValue?: number
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
  lastContact?: string
  nextFollowup?: string
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  company?: string
  type: LeadType
  source: LeadSource
  notes?: string
  tags?: string[]
}

export interface LeadActivity {
  id: string
  leadId: string
  userId: string
  type: 'call' | 'email' | 'note' | 'status_change' | 'assignment'
  description: string
  oldValue?: string
  newValue?: string
  createdAt: string
}