import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#0A2472] text-white hover:bg-[#1E3D8F] focus:ring-[#0A2472]',
    secondary: 'bg-[#F4C542] text-[#0A2472] hover:bg-[#F9D77E] focus:ring-[#F4C542]',
    outline: 'border-2 border-[#0A2472] text-[#0A2472] hover:bg-[#0A2472] hover:text-white focus:ring-[#0A2472]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={`
        rounded-lg font-medium transition duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}