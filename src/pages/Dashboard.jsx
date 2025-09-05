import React, { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import WorkoutLogEntry from '../components/WorkoutLogEntry'
import AIRecommendation from '../components/AIRecommendation'
import TrendChart from '../components/TrendChart'
import { Activity, Target, Calendar, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'

const Dashboard = () => {
  const { workouts, getAIInsights } = useAppContext()
  const [aiInsight, setAiInsight] = useState('')

  useEffect(() => {
    const fetchInsights = async () => {
      const insight = await getAIInsights()
      setAiInsight(insight || '')
    }
    
    if (workouts.length > 0) {
      fetchInsights()
    }
  }, [workouts, getAIInsights])

  // Calculate dashboard metrics
  const totalWorkouts = workouts.length
  const thisWeekWorkouts = workouts.filter(w => 
    new Date(w.startTime) >= subDays(new Date(), 7)
  ).length
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0)
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayWorkouts = workouts.filter(w => 
      format(new Date(w.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    return {
      name: format(date, 'EEE'),
      value: dayWorkouts.length,
      date: date.toISOString()
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text mb-2">Welcome to FitFlow AI</h1>
        <p className="text-muted">Your AI-powered fitness companion</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard variant="metricHighlight" className="animate-slide-up">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Total Workouts</p>
              <p className="text-2xl font-bold text-text">{totalWorkouts}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-accent" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">This Week</p>
              <p className="text-2xl font-bold text-text">{thisWeekWorkouts}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center">
            <Target className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Avg Duration</p>
              <p className="text-2xl font-bold text-text">{avgDuration}m</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Total Minutes</p>
              <p className="text-2xl font-bold text-text">{totalMinutes}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <AIRecommendation variant="positive">
            {aiInsight}
          </AIRecommendation>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <TrendChart 
            data={last7Days}
            title="Weekly Activity"
            variant="bar"
            dataKey="value"
            color="hsl(240 80% 50%)"
          />
        </DashboardCard>

        {/* Recent Workouts */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-semibold text-text mb-4">Recent Workouts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {workouts.slice(0, 5).map((workout) => (
              <WorkoutLogEntry 
                key={workout.workoutId} 
                workout={workout} 
                variant="simple"
              />
            ))}
            {workouts.length === 0 && (
              <p className="text-muted text-center py-8">
                No workouts logged yet. Start by logging your first workout!
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

export default Dashboard