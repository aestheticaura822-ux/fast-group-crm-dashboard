export const ROLES = {
  ADMIN: 'admin',
  CSR: 'csr',
  SALES: 'sales'
} as const

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CSR]: 'CSR',
  [ROLES.SALES]: 'Sales'
}

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [ROLES.CSR]: 'bg-blue-100 text-blue-800',
  [ROLES.SALES]: 'bg-green-100 text-green-800'
}