import React, { useMemo } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import TrendChart from '../components/TrendChart'
import WorkoutLogEntry from '../components/WorkoutLogEntry'
import { TrendingUp, Calendar, Target, Activity } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

const Progress = () => {
  const { workouts } = useAppContext()

  // Calculate progress metrics
  const progressData = useMemo(() => {
    if (!workouts.length) return null

    // Weekly workout counts for the last 8 weeks
    const weeklyData = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7))
      const weekEnd = endOfWeek(weekStart)
      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime)
        return workoutDate >= weekStart && workoutDate <= weekEnd
      })
      
      weeklyData.push({
        name: format(weekStart, 'MMM d'),
        value: weekWorkouts.length,
        minutes: weekWorkouts.reduce((sum, w) => sum + w.duration, 0)
      })
    }

    // Exercise type distribution
    const exerciseTypes = workouts.reduce((acc, workout) => {
      acc[workout.exerciseType] = (acc[workout.exerciseType] || 0) + 1
      return acc
    }, {})

    const exerciseData = Object.entries(exerciseTypes).map(([name, count]) => ({
      name,
      value: count
    }))

    // Monthly progress
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dayWorkouts = workouts.filter(w => 
        format(new Date(w.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
      return {
        name: format(date, 'd'),
        value: dayWorkouts.reduce((sum, w) => sum + w.duration, 0),
        workouts: dayWorkouts.length
      }
    })

    return {
      weekly: weeklyData,
      exercises: exerciseData,
      daily: last30Days
    }
  }, [workouts])

  const stats = useMemo(() => {
    const thisWeek = workouts.filter(w => 
      new Date(w.startTime) >= startOfWeek(new Date())
    )
    const lastWeek = workouts.filter(w => {
      const weekStart = startOfWeek(subDays(new Date(), 7))
      const weekEnd = endOfWeek(weekStart)
      const workoutDate = new Date(w.startTime)
      return workoutDate >= weekStart && workoutDate <= weekEnd
    })

    const thisWeekCount = thisWeek.length
    const lastWeekCount = lastWeek.length
    const weeklyChange = lastWeekCount > 0 ? 
      ((thisWeekCount - lastWeekCount) / lastWeekCount * 100).toFixed(1) : 0

    const thisWeekMinutes = thisWeek.reduce((sum, w) => sum + w.duration, 0)
    const lastWeekMinutes = lastWeek.reduce((sum, w) => sum + w.duration, 0)
    const minutesChange = lastWeekMinutes > 0 ? 
      ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes * 100).toFixed(1) : 0

    return {
      thisWeekCount,
      weeklyChange,
      thisWeekMinutes,
      minutesChange
    }
  }, [workouts])

  if (!progressData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Progress Tracking</h1>
          <p className="text-muted">Visualize your fitness journey</p>
        </div>
        
        <DashboardCard>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">No Data Yet</h3>
            <p className="text-muted">Start logging workouts to see your progress!</p>
          </div>
        </DashboardCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text mb-2">Progress Tracking</h1>
        <p className="text-muted">Visualize your fitness journey and achievements</p>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard variant="metricHighlight" className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">This Week</p>
              <p className="text-2xl font-bold text-text">{stats.thisWeekCount}</p>
              <p className="text-xs text-muted">workouts</p>
            </div>
            <div className={`text-right ${stats.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 ml-auto mb-1" />
              <span className="text-xs font-medium">
                {stats.weeklyChange >= 0 ? '+' : ''}{stats.weeklyChange}%
              </span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Weekly Minutes</p>
              <p className="text-2xl font-bold text-text">{stats.thisWeekMinutes}</p>
              <p className="text-xs text-muted">minutes</p>
            </div>
            <div className={`text-right ${stats.minutesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 ml-auto mb-1" />
              <span className="text-xs font-medium">
                {stats.minutesChange >= 0 ? '+' : ''}{stats.minutesChange}%
              </span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center">
            <Target className="h-8 w-8 text-accent" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Avg Duration</p>
              <p className="text-2xl font-bold text-text">
                {workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0}m
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted">Total Workouts</p>
              <p className="text-2xl font-bold text-text">{workouts.length}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workout Count */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <TrendChart 
            data={progressData.weekly}
            title="Weekly Workout Count"
            variant="line"
            dataKey="value"
            color="hsl(240 80% 50%)"
          />
        </DashboardCard>

        {/* Exercise Distribution */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <TrendChart 
            data={progressData.exercises}
            title="Exercise Types"
            variant="bar"
            dataKey="value"
            color="hsl(160 80% 50%)"
          />
        </DashboardCard>
      </div>

      {/* Daily Activity (Last 30 Days) */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <TrendChart 
          data={progressData.daily}
          title="Daily Workout Minutes (Last 30 Days)"
          variant="line"
          dataKey="value"
          color="hsl(240 80% 50%)"
        />
      </DashboardCard>

      {/* Recent Workouts */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '700ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">Recent Workout Details</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {workouts.slice(0, 10).map((workout) => (
            <WorkoutLogEntry 
              key={workout.workoutId} 
              workout={workout} 
              variant="detailed"
            />
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}

export default Progress