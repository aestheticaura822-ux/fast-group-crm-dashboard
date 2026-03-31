export const validators = {
  email: (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  phone: (phone: string) => {
    const re = /^[\d\s\+\-\(\)]{10,}$/
    return re.test(phone)
  },

  required: (value: any) => {
    return value !== undefined && value !== null && value !== ''
  },

  minLength: (value: string, min: number) => {
    return value.length >= min
  },

  maxLength: (value: string, max: number) => {
    return value.length <= max
  },

  range: (value: number, min: number, max: number) => {
    return value >= min && value <= max
  },

  url: (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}