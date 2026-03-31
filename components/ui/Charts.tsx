'use client'

import {
  LineChart as RechartsLine,
  Line,
  BarChart as RechartsBar,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0A2472', '#F4C542', '#10b981', '#ef4444', '#8b5cf6']

interface LineChartProps {
  data?: any[]
}

export function LineChart({ data = [] }: LineChartProps) {
  const defaultData = [
    { name: 'Mon', leads: 40 },
    { name: 'Tue', leads: 30 },
    { name: 'Wed', leads: 45 },
    { name: 'Thu', leads: 50 },
    { name: 'Fri', leads: 35 },
    { name: 'Sat', leads: 25 },
    { name: 'Sun', leads: 20 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLine data={data.length ? data : defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="leads" stroke="#0A2472" strokeWidth={2} />
      </RechartsLine>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data?: any[]
}

export function BarChart({ data = [] }: BarChartProps) {
  const defaultData = [
    { name: 'Ahmed', leads: 40, conversions: 24 },
    { name: 'Fatima', leads: 30, conversions: 18 },
    { name: 'Omar', leads: 45, conversions: 27 },
    { name: 'Sara', leads: 50, conversions: 30 },
    { name: 'Bilal', leads: 35, conversions: 21 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBar data={data.length ? data : defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="leads" fill="#0A2472" />
        <Bar dataKey="conversions" fill="#F4C542" />
      </RechartsBar>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data?: any[]
}

export function PieChart({ data = [] }: PieChartProps) {
  const defaultData = [
    { name: 'Website', value: 400 },
    { name: 'Facebook', value: 300 },
    { name: 'LinkedIn', value: 200 },
    { name: 'Google Maps', value: 150 },
    { name: 'Manual', value: 100 }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPie>
        <Pie
          data={data.length ? data : defaultData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => entry.name}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {(data.length ? data : defaultData).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPie>
    </ResponsiveContainer>
  )
}