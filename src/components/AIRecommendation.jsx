import React from 'react'
import { Brain, TrendingUp, AlertCircle } from 'lucide-react'

const AIRecommendation = ({ children, variant = 'positive' }) => {
  const variants = {
    positive: {
      icon: TrendingUp,
      bgClass: 'bg-gradient-to-r from-accent/10 to-accent/5',
      borderClass: 'border-accent/30',
      iconClass: 'text-accent'
    },
    constructive: {
      icon: AlertCircle,
      bgClass: 'bg-gradient-to-r from-yellow-50 to-yellow-25',
      borderClass: 'border-yellow-200',
      iconClass: 'text-yellow-600'
    }
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div className={`${config.bgClass} ${config.borderClass} border rounded-lg p-4 animate-fade-in`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Insight</span>
          </div>
          <p className="text-sm text-text leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  )
}

export default AIRecommendation