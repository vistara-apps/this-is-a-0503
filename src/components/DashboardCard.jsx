import React from 'react'

const DashboardCard = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'bg-surface rounded-lg shadow-card p-6 transition-all duration-250'
  
  const variants = {
    default: 'hover:shadow-lg',
    metricHighlight: 'bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 hover:shadow-lg'
  }

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

export default DashboardCard