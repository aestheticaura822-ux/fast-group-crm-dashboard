const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export async function getLeads(filters?: any) {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`${API_BASE}/api/leads?${params}`)
  
  if (!res.ok) throw new Error('Failed to fetch leads')
  return res.json()
}

export async function getLead(id: string) {
  const res = await fetch(`${API_BASE}/api/leads/${id}`)
  
  if (!res.ok) throw new Error('Failed to fetch lead')
  return res.json()
}

export async function createLead(data: any) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) throw new Error('Failed to create lead')
  return res.json()
}

export async function updateLead(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) throw new Error('Failed to update lead')
  return res.json()
}

export async function deleteLead(id: string) {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: 'DELETE'
  })
  
  if (!res.ok) throw new Error('Failed to delete lead')
  return res.json()
}