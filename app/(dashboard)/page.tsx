'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardRedirect() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'csr':
          router.push('/csr/leads')
          break
        case 'sales':
          router.push('/sales/reports')
          break
        default:
          router.push('/login')
      }
    } else {
      // If no user, redirect to login after a short delay
      const timer = setTimeout(() => {
        router.push('/login')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C41E3A] to-[#8B1528]">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-block p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C0C0C0] rounded-xl flex items-center justify-center text-xl sm:text-2xl text-[#8B1528] font-bold">
              FG
            </div>
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-white mb-1">Fast Group CRM</h1>
          <p className="text-[10px] sm:text-xs text-white/70">Redirecting you to dashboard...</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-white/30 border-t-white"></div>
        </div>

        {/* Loading Text */}
        <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-white/50">
          Please wait while we redirect you...
        </p>
      </div>
    </div>
  )
}