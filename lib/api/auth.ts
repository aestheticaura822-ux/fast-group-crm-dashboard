const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST'
  })
  
  if (!res.ok) throw new Error('Logout failed')
  return res.json()
}

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST'
  })
  
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}