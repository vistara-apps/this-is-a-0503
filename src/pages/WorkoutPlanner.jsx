import React, { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import DashboardCard from '../components/DashboardCard'
import { Brain, Clock, Target, Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const WorkoutPlanner = () => {
  const { generateWorkoutPlan, subscriptionTier, loading } = useAppContext()
  const [formData, setFormData] = useState({
    goals: '',
    fitnessLevel: 'beginner',
    availableTime: 30,
    workoutType: 'full-body'
  })
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGeneratePlan = async (e) => {
    e.preventDefault()
    
    if (!formData.goals.trim()) {
      toast.error('Please enter your fitness goals')
      return
    }

    setIsGenerating(true)
    try {
      const plan = await generateWorkoutPlan(
        formData.goals,
        formData.fitnessLevel,
        formData.availableTime
      )
      setGeneratedPlan(plan)
      
      if (subscriptionTier === 'free') {
        toast.info('Upgrade to get personalized workout plans!')
      } else {
        toast.success('Workout plan generated successfully!')
      }
    } catch (error) {
      toast.error('Failed to generate workout plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const isPremiumFeature = subscriptionTier === 'free'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text mb-2">AI Workout Planner</h1>
        <p className="text-muted">Get personalized workout plans tailored to your goals and fitness level</p>
      </div>

      {/* Premium Feature Notice */}
      {isPremiumFeature && (
        <DashboardCard className="animate-slide-up border-amber-200 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Premium Feature</h3>
              <p className="text-amber-700 text-sm">
                Upgrade to Core or Advanced plan to get personalized AI workout plans tailored to your specific goals and fitness level.
              </p>
            </div>
          </div>
        </DashboardCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Plan Form */}
        <DashboardCard className="animate-slide-up">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
            <Target className="h-5 w-5 text-primary mr-2" />
            Plan Configuration
          </h2>
          
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Fitness Goals
              </label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                placeholder="e.g., Build muscle, lose weight, improve endurance, get stronger..."
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>

            {/* Fitness Level */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Fitness Level
              </label>
              <select
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
            </div>

            {/* Available Time */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Available Time (minutes)
              </label>
              <select
                name="availableTime"
                value={formData.availableTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>

            {/* Workout Type */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Workout Type
              </label>
              <select
                name="workoutType"
                value={formData.workoutType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="full-body">Full Body</option>
                <option value="upper-body">Upper Body</option>
                <option value="lower-body">Lower Body</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="hiit">HIIT</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Plan...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Workout Plan
                </>
              )}
            </button>
          </form>
        </DashboardCard>

        {/* Generated Plan */}
        <DashboardCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
            <Zap className="h-5 w-5 text-accent mr-2" />
            Your Personalized Plan
          </h2>
          
          {generatedPlan ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-text font-sans">
                  {generatedPlan}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted">
                Fill out the form and click "Generate Workout Plan" to get your personalized workout plan
              </p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Features Overview */}
      <DashboardCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-text mb-4">AI Workout Planner Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium text-text mb-2">Goal-Oriented</h4>
            <p className="text-sm text-muted">
              Plans tailored to your specific fitness goals and objectives
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mx-auto mb-3">
              <Brain className="h-6 w-6 text-accent" />
            </div>
            <h4 className="font-medium text-text mb-2">AI-Powered</h4>
            <p className="text-sm text-muted">
              Advanced AI analyzes your profile to create optimal workout routines
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-text mb-2">Time-Efficient</h4>
            <p className="text-sm text-muted">
              Maximizes results within your available time constraints
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default WorkoutPlanner
