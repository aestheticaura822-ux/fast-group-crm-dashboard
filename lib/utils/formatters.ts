export const formatters = {
  currency: (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency
    }).format(amount)
  },

  date: (date: string | Date, format: 'short' | 'long' = 'short') => {
    const d = new Date(date)
    if (format === 'short') {
      return d.toLocaleDateString('en-PK')
    }
    return d.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  phone: (phone: string) => {
    // Format: +92 300 1234567
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{7})$/)
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]}`
    }
    return phone
  },

  percentage: (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`
  },

  number: (value: number) => {
    return new Intl.NumberFormat('en-PK').format(value)
  }
}