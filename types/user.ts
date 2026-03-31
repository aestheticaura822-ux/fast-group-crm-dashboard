export type UserRole = 'admin' | 'csr' | 'sales'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  department?: string
  createdAt: string
  lastActive?: string
  status: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
}

export interface UserFormData {
  name: string
  email: string
  role: UserRole
  password?: string
  confirmPassword?: string
  phone?: string
  department?: string
}