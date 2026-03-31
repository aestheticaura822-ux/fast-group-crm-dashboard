const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users`)
  
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function getUser(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`)
  
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function createUser(data: any) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

export async function updateUser(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!res.ok) throw new Error('Failed to update user')
  return res.json()
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'DELETE'
  })
  
  if (!res.ok) throw new Error('Failed to delete user')
  return res.json()
}