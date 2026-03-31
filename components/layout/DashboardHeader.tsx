'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export default function DashboardHeader({ setSidebarOpen }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 hover:text-[#C41E3A] text-2xl transition-colors duration-200"
          >
            ☰
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                🔍
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Notifications */}
            <button className="relative text-gray-700 hover:text-[#C41E3A] transition-colors duration-200">
              <span className="text-xl sm:text-2xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-500 text-white text-[9px] sm:text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#C41E3A] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline-block text-xs sm:text-sm text-gray-700">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg py-1 sm:py-2 z-20 border border-gray-100">
                  <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 sm:px-4 py-2 text-red-600 text-xs sm:text-sm hover:bg-gray-50 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}