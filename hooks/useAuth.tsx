'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'csr' | 'sales'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ✅ Use environment variable or default to 3002
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fast-group-crm-backend.vercel.app'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        console.log('🔍 Verifying token with:', `${API_URL}/api/auth/verify`)
        
        // Remove timeout completely
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
          // No signal, no timeout
        })

        console.log('📡 Verify response status:', response.status)

        if (response.ok) {
          setUser(JSON.parse(storedUser))
          console.log('✅ Token verified, user restored')
        } else {
          console.log('❌ Token invalid, clearing storage')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error: any) {
        console.error('❌ Auth verification error:', error)
        
        // Don't clear token on network errors
        if (error.message === 'Failed to fetch') {
          console.log('🌐 Network error - backend not reachable')
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }
    
    setIsLoading(false)
  }

  initializeAuth()
}, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Login attempt to:', `${API_URL}/api/auth/login`)
      
      // ✅ Changed from 3001 to API_URL
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Login failed:', error)
        return false
      }

      const data = await response.json()
      
      // Save user and token
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      console.log('✅ Login successful for:', data.user.email)
      return true
    } catch (error) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Call logout API (optional - clears server session)
      if (token) {
        // ✅ Changed from 3001 to API_URL
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}