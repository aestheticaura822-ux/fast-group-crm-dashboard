export interface DailyReport {
  date: string
  newLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  contacted: number
  converted: number
  notInterested: number
  revenue: number
  topSources: Array<{ source: string; count: number }>
  teamPerformance: Array<{ userId: string; name: string; conversions: number; revenue: number }>
}

export interface MonthlyReport extends DailyReport {
  month: string
  trend: Array<{ date: string; leads: number; conversions: number }>
  conversionRate: number
  averageDealValue: number
  totalRevenue: number
  projectRevenue: number
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  userId?: string
  source?: string
  type?: string
}