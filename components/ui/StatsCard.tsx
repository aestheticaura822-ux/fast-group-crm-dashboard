import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: string
  color?: string
}

export default function StatsCard({ title, value, change, icon, color = 'blue' }: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="dashboard-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}