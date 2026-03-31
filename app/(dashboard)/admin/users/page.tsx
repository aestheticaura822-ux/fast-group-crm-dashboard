'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import { useUsers, User } from '@/hooks/useUsers'

export default function UsersPage() {
  const { getUsers, deleteUser, updateUserStatus, isLoading } = useUsers()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter ? user.role === roleFilter : true
    const matchesStatus = statusFilter ? 
      (statusFilter === 'active' ? user.is_active : !user.is_active) : true
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} user(s)? This action cannot be undone.`)) return
    
    try {
      for (const id of ids) {
        await deleteUser(id)
      }
      fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error deleting users:', error)
      alert('Failed to delete users')
    }
  }

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus)
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const applyFilters = () => {
    console.log('Filters applied')
  }

  const resetFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41E3A]"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 md:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs sm:text-sm text-gray-600">Manage team members and their permissions</p>
        </div>
        <Link href="/admin/users/create">
          <button className="bg-[#C41E3A] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base
                   hover:bg-[#8B1528] transition-all duration-300 shadow-md">
            Add New User
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[180px] sm:min-w-[200px] px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A]"
          />
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A]"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="csr">CSR</option>
            <option value="sales">Sales</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={applyFilters} className="bg-[#C41E3A] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#8B1528] transition-all duration-300">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="border-2 border-[#C41E3A] text-[#C41E3A] px-4 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">
            Reset
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-blue-700">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-3">
            <button className="border-2 border-[#C41E3A] text-[#C41E3A] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#C41E3A] hover:text-white transition-all duration-300">
              Bulk Edit
            </button>
            <button 
              onClick={() => handleDelete(selectedUsers)}
              className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-700 transition-all duration-300"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            data={filteredUsers}
            selectable
            onSelect={setSelectedUsers}
            columns={[
              { 
                key: 'name', 
                label: 'Name',
                render: (value, row) => (
                  <div>
                    <div className="font-medium text-gray-900 text-xs sm:text-sm">{value}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">{row.email}</div>
                  </div>
                )
              },
              { 
                key: 'role', 
                label: 'Role',
                render: (value) => (
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                    value === 'admin' ? 'bg-purple-100 text-purple-800' :
                    value === 'csr' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {value.toUpperCase()}
                  </span>
                )
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (value, row) => (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                    <StatusBadge status={value ? 'active' : 'inactive'} />
                    <button
                      onClick={() => handleStatusToggle(row.id, value)}
                      className="text-[10px] sm:text-xs text-[#C41E3A] hover:underline"
                    >
                      Toggle
                    </button>
                  </div>
                )
              },
              { 
                key: 'last_login', 
                label: 'Last Active',
                render: (value) => <span className="text-[10px] sm:text-xs text-gray-500">{value ? new Date(value).toLocaleString() : 'Never'}</span>
              },
              { 
                key: 'created_at', 
                label: 'Member Since',
                render: (value) => <span className="text-[10px] sm:text-xs text-gray-500">{new Date(value).toLocaleDateString()}</span>
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${row.id}/edit`}>
                      <button className="text-[#C41E3A] hover:text-[#8B1528] text-[10px] sm:text-xs font-medium">
                        Edit
                      </button>
                    </Link>
                    <button 
                      className="text-red-600 hover:text-red-800 text-[10px] sm:text-xs font-medium"
                      onClick={() => handleDelete([row.id])}
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs text-gray-500">Total Users</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs text-gray-500">Active Users</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
            {users.filter(u => u.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs text-gray-500">Admins</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs text-gray-500">CSR & Sales</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#C41E3A]">
            {users.filter(u => u.role === 'csr' || u.role === 'sales').length}
          </div>
        </div>
      </div>
    </motion.div>
  )
}