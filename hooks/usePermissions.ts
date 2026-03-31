'use client'

import { useAuth } from './useAuth'

type Permission = 
  | 'view_leads'
  | 'create_leads'
  | 'edit_leads'
  | 'delete_leads'
  | 'convert_leads'
  | 'assign_leads'
  | 'view_reports'
  | 'view_own_reports'
  | 'manage_users'
  | 'view_activities'

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_leads',
    'create_leads',
    'edit_leads',
    'delete_leads',
    'convert_leads',
    'assign_leads',
    'view_reports',
    'manage_users',
    'view_activities'
  ],
  csr: [
    'view_leads',
    'create_leads',
    'edit_leads',
    'assign_leads',
    'view_activities'
  ],
  sales: [
    'view_leads',
    'convert_leads',
    'view_own_reports'
  ]
}

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: Permission) => {
    if (!user) return false
    const permissions = rolePermissions[user.role] || []
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]) => {
    return permissions.some(hasPermission)
  }

  const hasAllPermissions = (permissions: Permission[]) => {
    return permissions.every(hasPermission)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: user?.role
  }
}