import React from 'react'
import { format } from 'date-fns'
import { Clock, Target, Weight, MapPin } from 'lucide-react'

const WorkoutLogEntry = ({ workout, variant = 'simple' }) => {
  const formatMetrics = (metrics) => {
    if (metrics.sets && metrics.reps) {
      return `${metrics.sets} sets × ${metrics.reps} reps${metrics.weight ? ` @ ${metrics.weight}lbs` : ''}`
    }
    if (metrics.distance) {
      return `${metrics.distance} miles${metrics.pace ? ` @ ${metrics.pace}/mile` : ''}`
    }
    if (metrics.notes) {
      return metrics.notes
    }
    return 'Completed'
  }

  if (variant === 'simple') {
    return (
      <div className="bg-surface rounded-md p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-text">{workout.exerciseType}</h3>
            <p className="text-sm text-muted mt-1">{formatMetrics(workout.metrics)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{format(new Date(workout.startTime), 'MMM d')}</p>
            <p className="text-xs text-muted flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {workout.duration}m
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-text">{workout.exerciseType}</h3>
        <span className="text-sm text-muted">{format(new Date(workout.startTime), 'MMM d, yyyy')}</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-primary mr-2" />
          <div>
            <p className="text-xs text-muted">Duration</p>
            <p className="font-medium">{workout.duration}m</p>
          </div>
        </div>
        
        {workout.metrics.sets && (
          <div className="flex items-center">
            <Target className="h-4 w-4 text-primary mr-2" />
            <div>
              <p className="text-xs text-muted">Sets</p>
              <p className="font-medium">{workout.metrics.sets}</p>
            </div>
          </div>
        )}
        
        {workout.metrics.weight && (
          <div className="flex items-center">
            <Weight className="h-4 w-4 text-primary mr-2" />
            <div>
              <p className="text-xs text-muted">Weight</p>
              <p className="font-medium">{workout.metrics.weight}lbs</p>
            </div>
          </div>
        )}
        
        {workout.metrics.distance && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-primary mr-2" />
            <div>
              <p className="text-xs text-muted">Distance</p>
              <p className="font-medium">{workout.metrics.distance}mi</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted">{formatMetrics(workout.metrics)}</p>
    </div>
  )
}

export default WorkoutLogEntry