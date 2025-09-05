import React, { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import { PlusCircle, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const WorkoutLog = () => {
  const { logWorkout, loading } = useAppContext()
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [lastLogged, setLastLogged] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!workoutDescription.trim()) {
      toast.error('Please enter a workout description')
      return
    }

    try {
      const workout = await logWorkout(workoutDescription)
      setLastLogged(workout)
      setWorkoutDescription('')
      toast.success('Workout logged successfully!')
    } catch (error) {
      toast.error('Failed to log workout. Please try again.')
    }
  }

  const quickWorkouts = [
    '30 minutes running',
    '3 sets of 15 push-ups',
    '4 sets of 20 squats',
    '3 sets of 10 pull-ups',
    '45 minutes yoga',
    '20 minutes cycling'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text mb-2">Log Your Workout</h1>
        <p className="text-muted">Let AI automatically recognize and track your exercises</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Input Form */}
        <DashboardCard className="animate-slide-up">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2 text-primary" />
            New Workout
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="workout" className="block text-sm font-medium text-text mb-2">
                Describe your workout
              </label>
              <textarea
                id="workout"
                rows={4}
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="e.g., '3 sets of 12 bench press at 135 lbs' or '5 mile run in 45 minutes'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !workoutDescription.trim()}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Log Workout
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {lastLogged && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">
                  Successfully logged: {lastLogged.exerciseType}
                </span>
              </div>
            </div>
          )}
        </DashboardCard>

        {/* Quick Actions */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-text mb-4">Quick Log</h2>
          <p className="text-muted text-sm mb-4">
            Or choose from common workouts to log quickly
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickWorkouts.map((workout, index) => (
              <button
                key={index}
                onClick={() => setWorkoutDescription(workout)}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors duration-200 text-sm"
                disabled={loading}
              >
                {workout}
              </button>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Tips */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-text mb-3">💡 Tips for Better AI Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
          <div>
            <h4 className="font-medium text-text mb-1">For Strength Training:</h4>
            <ul className="space-y-1">
              <li>• Include sets, reps, and weight</li>
              <li>• Mention exercise name clearly</li>
              <li>• Example: "3 sets of 8 deadlifts at 225 lbs"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text mb-1">For Cardio:</h4>
            <ul className="space-y-1">
              <li>• Include duration and/or distance</li>
              <li>• Mention activity type</li>
              <li>• Example: "30 minute run, 3.5 miles"</li>
            </ul>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default WorkoutLog